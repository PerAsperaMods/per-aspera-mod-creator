import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface PurgeReport {
  status: 'success' | 'error';
  itemsDeleted: {
    resources: number;
    buildings: number;
    technologies: number;
    knowledge: number;
    enhancements: number;
    categories: number;
  };
  timestamp: Date;
  message: string;
}

export interface SDKInstallReport {
  status: 'success' | 'error' | 'already_installed';
  sdkPath: string;
  version: string;
  projectsCount: number;
  message: string;
  timestamp: Date;
}

export interface ModInitReport {
  status: 'success' | 'error';
  modPath: string;
  modName: string;
  projectFile: string;
  sdkLinked: boolean;
  message: string;
  timestamp: Date;
}

export interface YamlModInitReport {
  status: 'success' | 'error';
  modPath: string;
  modName: string;
  manifestFile: string;
  structure: string[];
  message: string;
  timestamp: Date;
}

export class DataManagementService {
  constructor(private pool: Pool) {}

  /**
   * Purge all official game data and reload from Phase 1
   */
  async purgeAndReloadData(): Promise<PurgeReport> {
    const report: PurgeReport = {
      status: 'success',
      itemsDeleted: {
        resources: 0,
        buildings: 0,
        technologies: 0,
        knowledge: 0,
        enhancements: 0,
        categories: 0,
      },
      timestamp: new Date(),
      message: '',
    };

    try {
      console.log('🗑️ Purging official game data...');

      // Delete all official items (is_official = true)
      const tables = ['resources', 'buildings', 'technologies', 'knowledge', 'enhancements', 'categories'];

      for (const table of tables) {
        const result = await this.pool.query(`
          DELETE FROM ${table}
          WHERE is_official = true
        `);
        report.itemsDeleted[table as keyof typeof report.itemsDeleted] = result.rowCount || 0;
      }

      // Reset auto-increment sequences
      for (const table of tables) {
        await this.pool.query(`
          ALTER SEQUENCE ${table}_id_seq RESTART WITH 1
        `).catch(() => {}); // Ignore if sequence doesn't exist
      }

      report.message = `✅ Purged ${Object.values(report.itemsDeleted).reduce((a, b) => a + b, 0)} official items`;
      console.log(report.message);

      return report;
    } catch (error: any) {
      report.status = 'error';
      report.message = `Error: ${error.message}`;
      console.error('❌ Purge failed:', error);
      return report;
    }
  }

  /**
   * Download and install Per Aspera SDK
   */
  async downloadAndInstallSDK(): Promise<SDKInstallReport> {
    const report: SDKInstallReport = {
      status: 'success',
      sdkPath: '',
      version: '',
      projectsCount: 0,
      message: '',
      timestamp: new Date(),
    };

    try {
      const sdkRepoUrl = 'https://github.com/PerAsperaMods/per-aspera-sdk.git';
      const sdkPath = path.join(process.cwd(), '..', 'SDK');

      report.sdkPath = sdkPath;

      // Check if SDK already installed
      if (fs.existsSync(sdkPath)) {
        report.status = 'already_installed';
        report.message = '✅ SDK already installed';

        // Count projects
        const projectDirs = fs.readdirSync(sdkPath).filter((dir) => {
          const fullPath = path.join(sdkPath, dir);
          return (
            fs.statSync(fullPath).isDirectory() &&
            fs.existsSync(path.join(fullPath, 'PerAspera.csproj'))
          );
        });

        report.projectsCount = projectDirs.length;
        console.log(`✅ SDK found: ${report.projectsCount} projects`);
        return report;
      }

      console.log(`📥 Downloading SDK from ${sdkRepoUrl}...`);

      // Clone SDK repository
      await execAsync(`git clone ${sdkRepoUrl} "${sdkPath}"`);

      // Count projects
      const projectDirs = fs.readdirSync(sdkPath).filter((dir) => {
        const fullPath = path.join(sdkPath, dir);
        return (
          fs.statSync(fullPath).isDirectory() &&
          fs.existsSync(path.join(fullPath, 'PerAspera.csproj'))
        );
      });

      report.projectsCount = projectDirs.length;
      report.message = `✅ SDK installed at ${sdkPath} with ${report.projectsCount} projects`;
      console.log(report.message);

      return report;
    } catch (error: any) {
      report.status = 'error';
      report.message = `Error: ${error.message}`;
      console.error('❌ SDK installation failed:', error);
      return report;
    }
  }

  /**
   * Initialize a new C# mod project
   */
  async initializeCSharpMod(modName: string, description: string): Promise<ModInitReport> {
    const report: ModInitReport = {
      status: 'success',
      modPath: '',
      modName,
      projectFile: '',
      sdkLinked: false,
      message: '',
      timestamp: new Date(),
    };

    try {
      const modsPath = path.join(process.cwd(), '..', 'Individual-Mods');
      const modPath = path.join(modsPath, modName);

      report.modPath = modPath;

      // Check if mod already exists
      if (fs.existsSync(modPath)) {
        report.status = 'error';
        report.message = `❌ Mod ${modName} already exists`;
        console.error(report.message);
        return report;
      }

      // Create mod directory structure
      console.log(`📦 Creating C# mod project: ${modName}...`);

      fs.mkdirSync(modPath, { recursive: true });
      fs.mkdirSync(path.join(modPath, 'Properties'), { recursive: true });
      fs.mkdirSync(path.join(modPath, 'Patches'), { recursive: true });
      fs.mkdirSync(path.join(modPath, 'Services'), { recursive: true });

      // Create .csproj file
      const csprojContent = `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net6.0</TargetFramework>
    <AssemblyName>${modName}</AssemblyName>
    <RootNamespace>${modName.replace(/[^a-zA-Z0-9]/g, '_')}</RootNamespace>
    <AllowUnsafeBlocks>true</AllowUnsafeBlocks>
    <LangVersion>11.0</LangVersion>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="BepInEx.Core" Version="6.0.0" />
    <PackageReference Include="HarmonyX" Version="2.10.1" />
    <PackageReference Include="UnityEngine.Modules.CoreModule" Version="2022.3.0" />
  </ItemGroup>

  <!-- Reference SDK -->
  <ItemGroup>
    <ProjectReference Include="..\\SDK\\PerAspera.ModSDK\\PerAspera.ModSDK.csproj" />
  </ItemGroup>

  <!-- Deploy to game -->
  <Target Name="DeployToGame" AfterTargets="Build">
    <Copy SourceFiles="$(TargetPath)" DestinationFolder="D:\\SteamLibrary\\steamapps\\common\\Per Aspera\\BepInEx\\plugins\\" />
  </Target>

</Project>`;

      fs.writeFileSync(path.join(modPath, `${modName}.csproj`), csprojContent);
      report.projectFile = `${modName}.csproj`;

      // Create Plugin.cs boilerplate
      const pluginContent = `using BepInEx;
using BepInEx.Logging;
using PerAspera.Core;
using PerAspera.ModSDK;

[BepInPlugin("com.modcreator.${modName.toLowerCase()}", "${modName}", "1.0.0")]
[BepInDependency("com.peraspera.sdk")]
public class ${modName}Plugin : BasePlugin
{
    public override void Load()
    {
        LogAspera.Initialize(Log, MyPluginInfo.PLUGIN_NAME);
        LogAspera.Info("${modName} plugin loaded!");

        // TODO: Add your mod logic here
        // Subscribe to game events, add patches, initialize data structures
    }

    public override void Unload()
    {
        LogAspera.Info("${modName} plugin unloaded");
    }
}`;

      fs.writeFileSync(path.join(modPath, 'Plugin.cs'), pluginContent);

      // Create README
      const readmeContent = `# ${modName}

${description}

## Build

\`\`\`bash
dotnet build
\`\`\`

## Deploy

The .csproj file includes a \`DeployToGame\` target that copies the DLL to BepInEx/plugins/ after building.

## References

- [Per Aspera SDK](../SDK/)
- [BepInEx Documentation](https://docs.bepinex.dev/)
- [HarmonyX Patching](https://harmony.pardeike.net/)
`;

      fs.writeFileSync(path.join(modPath, 'README.md'), readmeContent);

      report.sdkLinked = true;
      report.message = `✅ C# mod project initialized: ${modPath}`;
      console.log(report.message);

      return report;
    } catch (error: any) {
      report.status = 'error';
      report.message = `Error: ${error.message}`;
      console.error('❌ Mod initialization failed:', error);
      return report;
    }
  }

  /**
   * Initialize a new YAML mod project
   */
  async initializeYamlMod(modName: string, description: string): Promise<YamlModInitReport> {
    const report: YamlModInitReport = {
      status: 'success',
      modPath: '',
      modName,
      manifestFile: '',
      structure: [],
      message: '',
      timestamp: new Date(),
    };

    try {
      const yamlModsPath = path.join(process.cwd(), '..', 'Yaml-Mods');
      const modPath = path.join(yamlModsPath, modName);

      report.modPath = modPath;

      // Check if mod already exists
      if (fs.existsSync(modPath)) {
        report.status = 'error';
        report.message = `❌ YAML Mod ${modName} already exists`;
        console.error(report.message);
        return report;
      }

      // Create mod directory structure
      console.log(`🎨 Creating YAML mod project: ${modName}...`);

      fs.mkdirSync(modPath, { recursive: true });

      // Create subdirectories for different data types
      const subdirs = [
        'buildings',
        'resources',
        'technologies',
        'knowledge',
        'enhancements',
        'categories',
        'projects',
        'quests',
      ];

      for (const dir of subdirs) {
        fs.mkdirSync(path.join(modPath, dir), { recursive: true });
        report.structure.push(dir);
      }

      // Create manifest.yaml
      const manifestContent = `# Manifest for ${modName}
modId: "${modName}"
compatibleGameVersions:
  - 1.8.x
description: "${description}"

# Include different data types as needed
# Uncomment sections and add filenames as you create them

# Building definitions
building:
  filenames:
    # - buildings/building.yaml
  replace: false

# Resource definitions
resource:
  filenames:
    # - resources/resource.yaml
  replace: false

# Technology tree
technology:
  filenames:
    # - technologies/technology.yaml
  replace: false

# Knowledge entries
knowledge:
  filenames:
    # - knowledge/knowledge.yaml
  replace: false

# Enhancements
enhancement:
  filenames:
    # - enhancements/enhancements.yaml
  replace: false

# Building categories
buildingCategory:
  filenames:
    # - categories/building-category.yaml
  replace: false

# Projects
project:
  filenames:
    # - projects/project.yaml
  replace: false

# Quests
quest:
  filenames:
    # - quests/quest.yaml
  replace: false
`;

      fs.writeFileSync(path.join(modPath, 'manifest.yaml'), manifestContent);
      report.manifestFile = 'manifest.yaml';

      // Create README.md
      const readmeContent = `# ${modName}

${description}

## Structure

This mod is organized into categories:

- \`buildings/\` - Building definitions and modifications
- \`resources/\` - Resource definitions
- \`technologies/\` - Technology tree entries
- \`knowledge/\` - Knowledge base entries
- \`enhancements/\` - Building enhancements
- \`categories/\` - Building categories
- \`projects/\` - Special projects
- \`quests/\` - Quest definitions

## Usage

1. Edit YAML files in their respective directories
2. Update \`manifest.yaml\` to include your files
3. Deploy using the Mod Creator's deploy feature

## References

- [YAML Modding Guide](../../Organization-Wiki/)
- [Game Data Model](../../Internal_doc/Yaml/)
- [Validation Rules](../../Tools/validate_yaml_mods.py)
`;

      fs.writeFileSync(path.join(modPath, 'README.md'), readmeContent);

      // Create a template building file
      const buildingTemplate = `# Template building - rename and customize as needed
building_example:
  categoryType: !buildingCategory category_core
  name: BE_building_example_name
  description: BE_building_example_description
  maxHealth: 100.0
  healthLossPerDay: 0.05
  powerConsumption: 5.0
  powerPriority: 1.0
  droneCapacity: 1
  progressPerDay: 0.1
  outputQuantity: 0
  outputResource: null
  inputResources: {}
  requiredConstructionResources: {}
  knowledge: null
  prefabName: ExampleBuilding
  rubblePrefabName: RubblePile_S
  compactName: Example
`;

      fs.writeFileSync(
        path.join(modPath, 'buildings', 'template-building.yaml'),
        buildingTemplate
      );

      report.message = `✅ YAML mod created at ${modPath}`;
      console.log(report.message);

      return report;
    } catch (error: any) {
      report.status = 'error';
      report.message = `Error: ${error.message}`;
      console.error('❌ YAML mod initialization failed:', error);
      return report;
    }
  }
}
