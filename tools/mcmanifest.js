/*
 * Copyright (c) 2016-2017  Moddable Tech, Inc.
 *
 *   This file is part of the Moddable SDK Tools.
 * 
 *   The Moddable SDK Tools is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 * 
 *   The Moddable SDK Tools is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 * 
 *   You should have received a copy of the GNU General Public License
 *   along with the Moddable SDK Tools.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { FILE, TOOL } from "tool";

var formatNames = {
	gray16: "gray16",
	gray256: "gray256",
	rgb332: "rgb332",
	rgb565le: "rgb565le",
	rgb565be: "rgb565be",
	clut16: "clut16",
	x: "x",
};

var formatValues = {
	gray16: 4,
	gray256: 5,
	rgb332: 6,
	rgb565le: 7,
	rgb565be: 8,
	clut16: 11,
	x: 0,
};

export class MakeFile extends FILE {
	constructor(path) {
		super(path)
	}
	echo(tool, ...strings) {
		if (tool.windows)
			this.write("\t@echo # ");
		else
			this.write("\t@echo \"# ");
		for (var string of strings)
			this.write(string);
		if (tool.windows)
			this.write("\n");
		else
			this.write("\"\n");
	}
	generate(tool) {
		this.generateDefinitions(tool)
		this.write(tool.readFileString(tool.fragmentPath));
		this.line("");
		this.generateRules(tool)
		this.close();
	}
	generateDataDefinitions(tool) {
		this.write("DATA =");
		for (var result of tool.dataFiles) {
			this.write("\\\n\t$(DATA_DIR)");
			this.write(tool.slash);
			this.write(result.target);
		}	
		this.line("");
		this.line("");
	}
	generateDataRules(tool) {
		for (var result of tool.dataFiles) {
			var source = result.source;
			var target = result.target;
			this.line("$(DATA_DIR)", tool.slash, target, ": ", source);
			this.echo(tool, "copy ", target);
			if (tool.windows)
				this.line("\tcopy /Y $** $@");
			else
				this.line("\tcp $< $@");
		}
		this.line("");
	}
	generateBLEDefinitions(tool) {
		this.write("BLE =");
		this.write("\\\n\t$(TMP_DIR)");
		this.write(tool.slash);
		this.write("mc.bleservices.c");
		this.line("");
		this.line("");
	}
	generateBLERules(tool) {
		this.write("$(TMP_DIR)");
		this.write(tool.slash);
		this.write("mc.bleservices.c:");
		for (var result of tool.bleServicesFiles)
			this.write(` ${result.source}`);
		this.line("");
		this.echo(tool, "bles2gatt bleservices");
		this.write("\t$(BLES2GATT)");
		this.write(tool.windows ? " $**" : " $^");
		this.write(" -o $(TMP_DIR)");
		this.line("");
		this.line("");
	}
	generateDefinitions(tool) {
		this.line('# WARNING: This file is automatically generated. Do not edit. #');
		if (tool.debug)
			this.line("DEBUG = 1");
		if (tool.debug || tool.instrument)
			this.line("INSTRUMENT = 1");
		if (tool.verbose)
			this.line("VERBOSE = 1");
		for (var result in tool.environment)
			this.line(result, " = ", tool.environment[result].replace(/ /g, "\\ "));
		this.line("");
			
		this.line("BIN_DIR = ", tool.binPath);
		this.line("BUILD_DIR = ", tool.buildPath);
		this.line("DATA_DIR = ", tool.dataPath);
		this.line("MAIN_DIR = ", tool.mainPath);
		this.line("MODULES_DIR = ", tool.modulesPath);
		this.line("RESOURCES_DIR = ", tool.resourcesPath);
		this.line("TMP_DIR = ", tool.tmpPath);
		this.line("XS_DIR = ", tool.xsPath);
		this.line("");
		
		this.generateManifestDefinitions(tool);
		this.generateModulesDefinitions(tool);
		this.generateObjectsDefinitions(tool);
		this.generateDataDefinitions(tool);
		this.generateBLEDefinitions(tool);
		this.generateResourcesDefinitions(tool);
	}
	generateManifestDefinitions(tool) {
		this.write("MANIFEST =");
		for (var result in tool.manifests.already) {
			this.write(" \\\n\t");
			this.write(result);
		}	
		this.line("");
		this.line("");
	}
	generateModulesDefinitions(tool) {
		this.write("MODULES =");
		for (var result of tool.jsFiles) {
			this.write("\\\n\t$(MODULES_DIR)");
			this.write(tool.slash);
			this.write(result.target);
		}	
		this.line("");
		this.line("");
	}
	generateModulesRules(tool) {
		for (var result of tool.jsFiles) {
			var source = result.source;
			var sourceParts = tool.splitPath(source);
			var target = result.target;
			var targetParts = tool.splitPath(target);
			this.line("$(MODULES_DIR)", tool.slash, target, ": ", source);
			this.echo(tool, "xsc ", target);
			var options = "";
			if (result.commonjs)
				options += " -m";
			if (tool.debug)
				options += " -d";
			if (tool.config)
				options += " -c";
			this.line("\t$(XSC) ", source, options, " -e -o $(@D) -r ", targetParts.name);
		}
		this.line("");
	}
	generateObjectsDefinitions(tool) {
	}
	generateObjectsRules(tool) {
	}
	generateResourcesDefinitions(tool) {
		this.write("RESOURCES = $(STRINGS)");
		for (var result of tool.resourcesFiles) {
			this.write("\\\n\t$(RESOURCES_DIR)");
			this.write(tool.slash);
			this.write(result.target);
		}	
		for (var result of tool.bmpColorFiles) {
			this.write("\\\n\t$(RESOURCES_DIR)");
			this.write(tool.slash);
			this.write(result.target);
		}	
		for (var result of tool.bmpAlphaFiles) {
			this.write("\\\n\t$(RESOURCES_DIR)");
			this.write(tool.slash);
			this.write(result.target);
		}	
		for (var result of tool.bmpFontFiles) {
			this.write("\\\n\t$(RESOURCES_DIR)");
			this.write(tool.slash);
			this.write(result.target);
		}	
		for (var result of tool.bmpMaskFiles) {
			this.write("\\\n\t$(RESOURCES_DIR)");
			this.write(tool.slash);
			this.write(result.target);
		}	
		for (var result of tool.clutFiles) {
			this.write("\\\n\t$(RESOURCES_DIR)");
			this.write(tool.slash);
			this.write(result.target);
		}	
		for (var result of tool.imageFiles) {
			this.write("\\\n\t$(RESOURCES_DIR)");
			this.write(tool.slash);
			this.write(result.target);
		}	
		for (var result of tool.soundFiles) {
			this.write("\\\n\t$(RESOURCES_DIR)");
			this.write(tool.slash);
			this.write(result.target);
		}	
		for (var result of tool.stringFiles) {
			this.write("\\\n\t$(RESOURCES_DIR)");
			this.write(tool.slash);
			this.write(result.target);
		}
		if (tool.stringFiles.length) {
			this.write("\\\n\t$(RESOURCES_DIR)");
			this.write(tool.slash);
			this.write("locals.mhi");
		}
		this.line("");
		this.line("");
	}
	generateResourcesRules(tool) {
		var definesPath = "$(TMP_DIR)" + tool.slash + "mc.defines.h";
		var formatPath = "$(TMP_DIR)" + tool.slash + "mc.format.h";
		var rotationPath = "$(TMP_DIR)" + tool.slash + "mc.rotation.h";
	
		for (var result of tool.resourcesFiles) {
			var source = result.source;
			var target = result.target;
			this.line("$(RESOURCES_DIR)", tool.slash, target, ": ", source);
			this.echo(tool, "copy ", target);
			if (tool.isDirectoryOrFile(source) < 0) {
				if (tool.windows)
					this.line("\tcopy /E /Y $** $@");
				else
					this.line("\tcp -R $< $@");
			}
			else {
				if (tool.windows)
					this.line("\tcopy /Y $** $@");
				else
					this.line("\tcp $< $@");
			}
		}
	
		if (tool.clutFiles) {
			for (var result of tool.clutFiles) {
				var source = result.source;
				var target = result.target;
				this.line("$(RESOURCES_DIR)", tool.slash, target, ": ", source);
				this.echo(tool, "buildclut ", target);
				this.line("\t$(BUILDCLUT) ", source, " -o $(@D)");
			}
		}

		for (var result of tool.bmpAlphaFiles) {
			var target = result.target;
			if (result.colorFile)
				this.line("$(RESOURCES_DIR)", tool.slash, target, ": $(RESOURCES_DIR)", tool.slash, result.colorFile.target);
			else {
				var source = result.source;
				this.line("$(RESOURCES_DIR)", tool.slash, target, ": ", source, " ", rotationPath);
				this.echo(tool, "png2bmp ", target);
				this.line("\t$(PNG2BMP) ", source, " -a -o $(@D) -r ", tool.rotation);
			}
		}
		
		for (var result of tool.bmpColorFiles) {
			var source = result.source;
			var target = result.target;
			var alphaTarget = result.alphaFile ? result.alphaFile.target : null;
			var clutSource = result.clutName ? "$(RESOURCES_DIR)" + tool.slash + result.clutName + ".cct" : null;
			this.write("$(RESOURCES_DIR)");
			this.write(tool.slash);
			this.write(target);
			this.write(": ");
			this.write(source);
			if (clutSource) {
				this.write(" ");
				this.write(clutSource);
			}
			this.write(" ");
			this.write(formatPath);
			this.write(" ");
			this.write(rotationPath);
			this.line("");
			if (tool.windows)
				this.write("\t@echo # png2bmp ");
			else
				this.write("\t@echo \"# png2bmp ");
			this.write(target);
			if (alphaTarget) {
				this.write(" ");
				this.write(alphaTarget);
			}
			if (tool.windows)
				this.line("");
			else
				this.line("\"");
			this.write("\t$(PNG2BMP) ");
			this.write(source);
			this.write(" -f ");
			this.write(tool.format);
			this.write(" -o $(@D) -r ");
			this.write(tool.rotation);
			if (!alphaTarget)
				this.write(" -c");
			if (clutSource) {
				this.write(" -clut ");
				this.write(clutSource);
			}
			this.line("");
		}
		
		for (var result of tool.bmpFontFiles) {
			var parts;
			var source = result.source;
			parts = tool.splitPath(source);
			parts.extension = ".png";
			var pngSource = tool.joinPath(parts);
			var target = result.target;
			parts = tool.splitPath(target);
			var bmpTarget = parts.name + "-alpha.bmp";
			var bmpSource = "$(RESOURCES_DIR)" + tool.slash + bmpTarget;
			this.line("$(RESOURCES_DIR)", tool.slash, target, ": ", source, " ", bmpSource, " ", rotationPath);
			this.echo(tool, "compressbmf ", target);
			this.line("\t$(COMPRESSBMF) ", source, " -i ", bmpSource, " -o $(@D) -r ", tool.rotation);
			this.line(bmpSource, ": ", pngSource, " ", rotationPath);
			this.echo(tool, "png2bmp ", bmpTarget);
			this.line("\t$(PNG2BMP) ", pngSource, " -a -o $(@D) -r ", tool.rotation, " -t");
		}

		for (var result of tool.bmpMaskFiles) {
			var parts;
			var source = result.source;
			var target = result.target;
			parts = tool.splitPath(target);
			var bmpTarget = parts.name + ".bmp";
			var bmpSource = "$(RESOURCES_DIR)" + tool.slash + bmpTarget;
			this.line("$(RESOURCES_DIR)", tool.slash, target, ": ", bmpSource);
			this.echo(tool, "rle4encode ", target);
			this.line("\t$(RLE4ENCODE) ", bmpSource, " -o $(@D)");
			this.line(bmpSource, ": ", source, " ", rotationPath);
			this.echo(tool, "png2bmp ", bmpTarget);
			this.line("\t$(PNG2BMP) ", source, " -a -o $(@D) -r ", tool.rotation, " -t");
		}
		
		for (var result of tool.imageFiles) {
			var source = result.source;
			var target = result.target;
			if (result.quality !== undefined) {
				var temporary = target + result.quality;
				this.line("$(RESOURCES_DIR)", tool.slash, temporary, ": ", source, " ", rotationPath);
				this.echo(tool, "image2cs ", temporary);
				this.line("\t$(IMAGE2CS) ", source, " -o $(@D) -q ", result.quality, " -r ", tool.rotation);
				this.line("$(RESOURCES_DIR)", tool.slash, target, ": $(RESOURCES_DIR)", tool.slash, temporary);
				this.echo(tool, "copy ", target);
				if (tool.windows)
					this.line("\tcopy /Y $** $@");
				else
					this.line("\tcp $< $@");
			}
			else {
				this.line("$(RESOURCES_DIR)", tool.slash, target, ": ", source, " ", rotationPath);
				this.echo(tool, "image2cs ", target);
				this.line("\t$(IMAGE2CS) ", source, " -o $(@D) -r ", tool.rotation);
			}
		}
		
		let bitsPerSample = 16, numChannels = 1, sampleRate = 11025;
		let defines = tool.defines;
		if (defines) {
			let audioOut = defines.audioOut;
			if (audioOut) {
				if ("bitsPerSample" in audioOut) bitsPerSample = audioOut.bitsPerSample;
				if ("numChannels" in audioOut) numChannels = audioOut.numChannels;
				if ("sampleRate" in audioOut) sampleRate = audioOut.sampleRate;
			}		
		}		
		for (var result of tool.soundFiles) {
			var source = result.source;
			var target = result.target;
			this.line("$(RESOURCES_DIR)", tool.slash, target, ": ", source, " ", definesPath);
			this.echo(tool, "wav2maud ", target);
			this.line("\t$(WAV2MAUD) ", source, " -o $(@D) -r ", sampleRate, " -c ", numChannels, " -s ", bitsPerSample);
		}
		
		for (var result of tool.stringFiles)
			this.line("$(RESOURCES_DIR)", tool.slash, result.target, ": ", "$(RESOURCES_DIR)", tool.slash, "locals.mhi");
		this.write("$(RESOURCES_DIR)");
		this.write(tool.slash);
		this.write("locals.mhi:");
		for (var result of tool.stringFiles) {
			this.write(" ");
			this.write(result.source);
		}
		this.line("");
		this.echo(tool, "mclocal strings");
		this.write("\t$(MCLOCAL)");
		this.write(tool.windows ? " $**" : " $^");
		if (tool.debug)
			this.write(" -d");
		if (tool.format)
			this.write(" -s");
		this.line(" -o $(@D)");
		this.line("");
	}
	generateRules(tool) {
		this.generateModulesRules(tool);
		this.generateObjectsRules(tool);
		this.generateDataRules(tool);
		this.generateBLERules(tool);
		this.generateResourcesRules(tool);
	}
}

export class PrerequisiteFile {
	constructor(path, tool) {
		this.path = path;
		this.tool = tool;
		this.former = tool.isDirectoryOrFile(path) ? tool.readFileString(path) : "";
		this.current = ""
	}
	close() {
		if (this.former.compare(this.current))
			this.tool.writeFileString(this.path, this.current);
	}
	line(...strings) {
		for (var string of strings)
			this.write(string);
		this.write("\n");
	}
	write(string) {
		this.current += string;
	}
}

export class FormatFile extends PrerequisiteFile {
	generate(tool) {
		this.line('/* WARNING: This file is automatically generated. Do not edit. */');
		this.line("");
		this.line("#define kCommodettoBitmapFormat ", formatValues[tool.format]);
		this.close();
	}
}

export class RotationFile extends PrerequisiteFile {
	generate(tool) {
		this.line('/* WARNING: This file is automatically generated. Do not edit. */');
		this.line("");
		this.line("#define kPocoRotation ", tool.rotation);
		this.close();
	}
}

class Rule {
	constructor(tool) {
		this.tool = tool;
	}
	appendFile(files, target, source, include) {
		this.count++;
		source = this.tool.resolveFilePath(source);
		if (!files.already[source]) {
			files.already[source] = true;
			if (include) {
				if (!files.find(file => file.target == target)) {
					//this.tool.report(target + " " + source);
					let result = { target, source };
					files.push(result);
					return result;
				}
			}
		}
	}
	appendFolder(folders, folder) {
		this.count++;
		if (!folders.already[folder]) {
			folders.already[folder] = true;
			folders.push(folder);
		}
	}
	appendSource(target, source, include, suffix, parts, kind) {
	}
	appendTarget(target) {
	}
	iterate(target, source, include, suffix, straight) {
		var tool = this.tool;
		var slash = source.lastIndexOf(tool.slash);
		var directory = this.tool.resolveDirectoryPath(source.slice(0, slash));
		if (directory) {
			this.count = 0;
			var star = source.lastIndexOf("*");
			var prefix = (star >= 0) ? source.slice(slash + 1, star) : source.slice(slash + 1);
			var names = tool.enumerateDirectory(directory);
			var c = names.length;
			for (var i = 0; i < c; i++) {
				var name = names[i];
				if (name[0] == ".")
					continue;
				var path = directory + tool.slash + name;
				var parts = tool.splitPath(path);
				if (star >= 0) {
					if (prefix) {
						if (parts.name.startsWith(prefix))
							name = parts.name.slice(prefix.length);
						else
							continue;
					}
					else
						name = parts.name;
				}
				else {
					if (parts.name == prefix)
						name = prefix;
					else
						continue;
				}
				var kind = tool.isDirectoryOrFile(path);
				if (straight)
					this.appendSource(target, path, include, suffix, parts, kind);
				else
					this.appendSource(target + name, path, include, suffix, parts, kind);
			}
			if (!this.count)
				this.noFilesMatch(source, star);
		}
		else
			tool.reportError(null, 0, "directory not found: " + source);
	}
	noFilesMatch(target) {
	}
	process(property) {
		var tool = this.tool;
		var target = "~";
		if (target in property) {
			var sources = property[target];
			if (sources instanceof Array) {
				for (var source of sources) 
					this.iterate(target, source, false, true);
			}
			else
				this.iterate(target, sources, false, true);
		}
		for (var target in property) {
			var sources = property[target];
			if (target == "~") {
			}
			else {
				target = tool.resolveSlash(target);
				var slash = target.lastIndexOf(tool.slash);
				if (slash >= 0)
					this.appendTarget(target.slice(0, slash));
				var star = target.lastIndexOf("*");
				if (star >= 0) {
					var suffix = target.slice(star + 1);
					target = target.slice(0, star);
					if (sources instanceof Array) {
						for (var source of sources)
							this.iterate(target, source, true, suffix, false);
					}
					else
						this.iterate(target, sources, true, suffix, false);
				}
				else {
					var suffix = "";
					if (sources instanceof Array) {
						for (var source of sources)
							this.iterate(target, source, true, suffix, true);
					}
					else
						this.iterate(target, sources, true, suffix, true);
				}
			}
		}
	}
};

class DataRule extends Rule {
	appendSource(target, source, include, suffix, parts, kind) {
		var tool = this.tool;
		if (kind < 0)
			return;
		this.appendFile(tool.dataFiles, target + parts.extension, source, include);
	}
	appendTarget(target) {
		this.appendFolder(this.tool.dataFolders, target);
	}
	noFilesMatch(source, star) {
		this.tool.reportWarning(null, 0, "no data match: " + source);
	}
};

class BLERule extends Rule {
	appendSource(target, source, include, suffix, parts, kind) {
		if ((parts.extension == ".json") && (parts.directory.endsWith("bleservices"))) {
			this.appendFile(this.tool.bleServicesFiles, parts.name, source, include);
		}
	}
};

class ModulesRule extends Rule {
	appendSource(target, source, include, suffix, parts, kind) {
		var tool = this.tool;
		if (kind < 0)
			return;
		if (tool.dataFiles.already[source])
			return;
		if (parts.extension == ".js")
			this.appendFile(tool.jsFiles, target + ".xsb", source, include);
		else if (parts.extension == ".c")
			this.appendFile(tool.cFiles, parts.name + ".c.o", source, include);
		else if (parts.extension == ".cc")
			this.appendFile(tool.cFiles, parts.name + ".cc.o", source, include);
		else if (parts.extension == ".cpp")
			this.appendFile(tool.cFiles, parts.name + ".cpp.o", source, include);
		else if (parts.extension == ".m")
			this.appendFile(tool.cFiles, parts.name + ".m.o", source, include);
		else if (parts.extension == ".java")
			this.appendFile(tool.javaFiles, parts.name + ".class", source, include);
		else if (parts.extension == ".h") {
			this.appendFolder(tool.cFolders, parts.directory);
			this.appendFolder(tool.hFiles, source);
		}
	}
	appendTarget(target) {
		this.appendFolder(this.tool.jsFolders, target);
	}
	noFilesMatch(source, star) {
		this.tool.reportWarning(null, 0, "no modules match: " + source);
	}
};

var moduleExtensions = [  
	".c", ".cc", ".cpp", ".h", ".java", ".js", ".json", ".m",
];

class ResourcesRule extends Rule {
	appendBitmap(name, path, include, suffix) {
		var tool = this.tool;
		let colorFile, alphaFile;
		if (tool.bmpAlphaFiles.already[path] || tool.bmpColorFiles.already[path] || tool.bmpMaskFiles.already[path])
			return;
		if (suffix == "-color") {
			colorFile = this.appendFile(tool.bmpColorFiles, name + "-color.bmp", path, include);
		}
		else if (suffix == "-alpha") {
			alphaFile = this.appendFile(tool.bmpAlphaFiles, name + "-alpha.bmp", path, include);
		}
		else if (suffix == "-mask") {
			alphaFile = this.appendFile(tool.bmpMaskFiles, name + "-alpha.bm4", path, include);
		}
		else {
			colorFile = this.appendFile(tool.bmpColorFiles, name + "-color.bmp", path, include);
			alphaFile = this.appendFile(tool.bmpAlphaFiles, name + "-alpha.bmp", path, include);
			alphaFile.colorFile = colorFile;
			colorFile.alphaFile = alphaFile;
		}
		if (colorFile) {
			colorFile.clutName = tool.clutFiles.current;
		}
	}
	appendFont(name, path, include, suffix) {
		var tool = this.tool;
		if (suffix == "-mask") {
			this.appendFile(tool.bmpFontFiles, name + ".bf4", path, include);
			return false;
		}
		this.appendFile(tool.resourcesFiles, name + ".fnt", path, include);
		return true;
	}
	appendFramework(files, target, source, include) {
		this.count++;
		source = this.tool.resolveDirectoryPath(source);
		if (!files.already[source]) {
			files.already[source] = true;
			if (include) {
				if (!files.find(file => file.target == target)) {
					//this.tool.report(target + " " + source);
					let result = { target, source };
					files.push(result);
					return result;
				}
			}
		}
	}
	appendImage(name, path, include, suffix) {
		var tool = this.tool;
		if (tool.imageFiles.already[path])
			return;
		let file = this.appendFile(tool.imageFiles, name + ".cs", path, include);
		let a = suffix.match(/-image(\(([0-9]+)\))?/);
		file.quality = (a && (a.length == 3) && (a[2] !== undefined)) ? parseInt(a[2]) : undefined;
	}
	appendImageDirectory(name, path, include, suffix) {
		var tool = this.tool;
		var files = tool.imageFiles;
		var source = tool.resolveDirectoryPath(path);
		var target = name + ".cs";
		if (files.already[source])
			return;
		files.already[source] = true;
		if (!include)
			return;
		if (files.find(file => file.target == target))
			return;
		let a = suffix.match(/-image(\(([0-9]+)\))?/);
		let quality = (a && (a.length == 3) && (a[2] !== undefined)) ? parseInt(a[2]) : undefined;
		files.push({ target, source, quality });
		this.count++;
	}
	appendSound(name, path, include, suffix) {
		var tool = this.tool;
		this.appendFile(tool.soundFiles, name + ".maud", path, include);
		return true;
	}
	appendSource(target, source, include, suffix, parts, kind) {
		var tool = this.tool;
		if (kind < 0) {
			if (tool.format) {
				for (var fps = 1; fps <= 60; fps++) {
					var extension = "." + fps + "fps";
					if (parts.extension == extension) {
						this.appendImageDirectory(target, source, include, suffix);
						return;
					}
				}
			}
			if (tool.platform == "x-ios" && (parts.extension == ".framework" || parts.extension == ".bundle")) {
				this.appendFramework(tool.resourcesFiles, target + parts.extension, source, include);
				return;
			}
			return;
		}
		if (tool.dataFiles.already[source])
			return;
		if ((parts.extension == ".json") && (parts.directory.endsWith("strings"))) {
			this.appendFile(tool.stringFiles, "locals." + parts.name + ".mhr", source, include);
			return;
		}
		if (tool.format) {
			if (parts.extension == ".act") {
				if (tool.format.startsWith("clut")) {
					this.appendFile(tool.clutFiles, target + ".cct", source, include);
					tool.clutFiles.current = target;
				}
				else
					this.count++;
				return;
			}
			if (parts.extension == ".fnt") {
				this.appendFont(target, source, include, suffix);
				return;
			}
			if (parts.extension == ".png") {
				if (suffix.startsWith("-image")) {
					this.appendImage(target, source, include, suffix);
					return;
				}
				parts.extension = ".fnt";
				if (!tool.bmpFontFiles.already[tool.joinPath(parts)])
					this.appendBitmap(target, source, include, suffix);
				return;
			}
			if ((parts.extension == ".gif") || (parts.extension == ".jpeg") || (parts.extension == ".jpg")) {
				this.appendImage(target, source, include, suffix);
				return;
			}
			if ((parts.extension == ".wav")) {
				this.appendSound(target, source, include, suffix);
				return;
			}
		}
		if (moduleExtensions.indexOf(parts.extension) >= 0)
			return;
		this.appendFile(tool.resourcesFiles, target + parts.extension, source, include);
	}
	appendTarget(target) {
		this.appendFolder(this.tool.resourcesFolders, target);
	}
	noFilesMatch(source) {
		this.tool.reportWarning(null, 0, "no resources match: " + source);
	}
};

export class Tool extends TOOL {
	constructor(argv) {
		super(argv);
		this.moddablePath = this.getenv("MODDABLE");
		if (!this.moddablePath)
			throw new Error("MODDABLE: variable not found!");
		
		this.config = {};
		this.debug = false;
		this.environment = { "MODDABLE": this.moddablePath }
		this.format = null;
		this.instrument = false;
		this.mainPath = null;
		this.make = false;
		this.manifestPath = null;
		this.outputPath = null;
		this.platform = null;
		this.rotation = 0;
		this.verbose = false;
		this.windows = this.currentPlatform == "win";
		this.slash = this.windows ? "\\" : "/";
		
		this.buildPath = this.moddablePath + this.slash + "build";
		this.xsPath = this.moddablePath + this.slash + "xs";
		
		var name, path;
		var argc = argv.length;
		for (var argi = 1; argi < argc; argi++) {
			var option = argv[argi];
			switch (option) {
			case "-d":
				this.debug = true;
				this.instrument = true;
				break;
			case "-f":
				argi++;	
				if (argi >= argc)
					throw new Error("-f: no format!");
				name = argv[argi];
				if (this.format)
					throw new Error("-f '" + name + "': too many formats!");
				name = name.toLowerCase();
				if (name in formatNames)
					name = formatNames[name];
				else
					throw new Error("-f '" + name + "': unknown format!");
				this.format = name;
				break;
			case "-i":
				this.instrument = true;
				break;
			case "-m":
				this.make = true;
				break;
			case "-o":
				argi++;	
				if (argi >= argc)
					throw new Error("-o: no directory!");
				name = argv[argi];
				if (this.outputPath)
					throw new Error("-o '" + name + "': too many directories!");
				path = this.resolveDirectoryPath(name);
				if (!path)
					throw new Error("-o '" + name + "': directory not found!");
				this.outputPath = path;
				break;
			case "-p":
				argi++;	
				if (argi >= argc)
					throw new Error("-p: no platform!");
				name = argv[argi];
				if (this.platform)
					throw new Error("-p '" + name + "': too many platforms!");
				name = name.toLowerCase();
				this.platform = name;
				break;
			case "-r":
				argi++;	
				if (argi >= argc)
					throw new Error("-r: no rotation!");
				name = parseInt(argv[argi]);
				if ((name != 0) && (name != 90) && (name != 180) && (name != 270))
					throw new Error("-r: " + name + ": invalid rotation!");
				this.rotation = name;
				break;
			case "-v":
				this.verbose = true;
				break;
			default:
				name = argv[argi];
				let split = name.split("=");
				if (split.length == 2) {
					this.config[split[0]] = split[1];
				}
				else {
					if (this.manifestPath)
						throw new Error("'" + name + "': too many manifests!");
					path = this.resolveFilePath(name);
					if (!path)
						throw new Error("'" + name + "': manifest not found!");
					this.manifestPath = path;
				}
				break;
			}
		}
		if (this.manifestPath) {
			var parts = this.splitPath(this.manifestPath);
			this.currentDirectory = this.mainPath = parts.directory;
		}
		else {
			path = this.resolveFilePath("." + this.slash + "manifest.json");
			if (path)
				this.manifestPath = path;
			else {
				path = this.resolveFilePath(".." + this.slash + "manifest.json");
				if (path)
					this.manifestPath = path;
				else
					throw new Error("no manifest!");
			}
			this.mainPath = this.currentDirectory;
		}
		var parts = this.splitPath(this.mainPath);
		this.environment.NAME = parts.name;
		if (!this.outputPath)
			this.outputPath = this.buildPath;
		if (!this.platform)
			this.platform = this.currentPlatform;
		if (this.platform.startsWith("x-"))
			this.format = null;
		else if (!this.format)
			this.format = "rgb565le";
		if (this.platform == "mac")
			this.environment.SIMULATOR = this.moddablePath + "/build/bin/mac/debug/Screen Test.app";
		else if (this.platform == "win")
			this.environment.SIMULATOR = this.moddablePath + "\\build\\bin\\win\\debug\\simulator.exe";
		else if (this.platform == "lin")
			this.environment.SIMULATOR = this.moddablePath + "/build/bin/lin/debug/simulator";
	}
	concatProperties(object, properties, flag) {
		if (properties) {
			for (let name in properties) {
				let property = properties[name];
				if (flag) {
					if (property instanceof Array)
						property = property.map(item => this.resolveSource(item));
					else if (typeof property == "string")
						property = this.resolveSource(property);
				}
				object[name] = this.concatProperty((name in object) ? object[name] : [], property);
			}
		}
	}
	concatProperty(array, value) {
		if ((value instanceof Array) || (typeof value == "string"))
			return array.concat(value);
		return array;
	}
	includeManifest(name) {
		var currentDirectory = this.currentDirectory;
		var path = this.resolveFilePath(name);
		if (!path)
			throw new Error("'" + name + "': manifest not found!");
		if (!this.manifests.already[path]) {
			var parts = this.splitPath(path);
			this.currentDirectory = parts.directory;
			var manifest = this.parseManifest(path);
			manifest.directory = parts.directory;
		}
		this.currentDirectory = currentDirectory;
	}
	mergeManifest(all, manifest) {
		var currentDirectory = this.currentDirectory;
		this.currentDirectory = manifest.directory;
		this.mergePlatform(all, manifest);
		if ("platforms" in manifest) {
			let platform = this.platform;
			let platforms = manifest.platforms;
			let platformed = false;
			for (let name in platforms) {
				if (platform == name) {
					platformed = true;
					this.mergePlatform(all, platforms[name]);
				}
			}
			if (!platformed) {
				let name = "...";
				if (name in platforms)
					this.mergePlatform(all, platforms[name]);
			}
			delete manifest.platforms;
		}
		this.currentDirectory = currentDirectory;
	}
	mergePlatform(all, platform) {
		this.mergeProperties(all.config, platform.config);
		this.mergeProperties(all.creation, platform.creation);
		this.mergeProperties(all.defines, platform.defines);
		this.mergeProperties(all.ble, platform.ble);
		
		this.concatProperties(all.data, platform.data, true);
		this.concatProperties(all.modules, platform.modules, true);
		this.concatProperties(all.resources, platform.resources, true);
		this.concatProperties(all.recipes, platform.recipes);
		
		all.commonjs = this.concatProperty(all.commonjs, platform.commonjs);
		all.preload = this.concatProperty(all.preload, platform.preload);
		all.strip = this.concatProperty(all.strip, platform.strip);
		all.errors = this.concatProperty(all.errors, platform.error);
		all.warnings = this.concatProperty(all.warnings, platform.warning);
	}
	mergeProperties(targets, sources) {
		if (sources) {
			for (let name in sources) {
				let target = targets[name];
				let source = sources[name];
				if (target && source && (typeof target == "object") && (typeof source == "object"))
					this.mergeProperties(target, source);
				else
					targets[name] = source;
			}
		}
	}
	parseBuild(platform) {
		let properties = platform.build;
		if (properties) {
			for (let name in properties) {
				let value = properties[name];
				if (typeof value == "string")
					this.environment[name] = this.resolveVariable(value);
				else
					this.environment[name] = value;
			}
		}
	}
	parseManifest(path) {
		let platformInclude;
		var buffer = this.readFileString(path);
		try {
			var manifest = JSON.parse(buffer);
		}
		catch (e) {
			var message = e.toString();
			var result = /SyntaxError: \(host\): ([0-9]+): (.+)/.exec(message);
			if (result.length == 3) {
				this.reportError(path, parseInt(result[1]), result[2]);
			}
			throw new Error("'" + path + "': invalid manifest!");;
		}
		this.manifests.already[path] = manifest;
		this.parseBuild(manifest);
		if ("platforms" in manifest) {
			let platform = this.platform;
			let platforms = manifest.platforms;
			let platformed = false;
			for (let name in platforms) {
				if (platform == name) {
					platformed = true;
					this.parseBuild(platforms[name]);
					platformInclude = platforms[name].include;
				}
			}
			if (!platformed) {
				let name = "...";
				if (name in platforms) {
					this.parseBuild(platforms[name]);
					platformInclude = platforms[name].include;
				}
			}
			if (platformInclude) {
				if (!("include" in manifest))
					manifest.include = platformInclude;
				else
					manifest.include = manifest.include.concat(manifest.include, platformInclude);
			}
		}
		if ("include" in manifest) {
			if (manifest.include instanceof Array)
				manifest.include.forEach(include => this.includeManifest(this.resolveVariable(include)));
			else 
				this.includeManifest(this.resolveVariable(manifest.include));
		}
		this.manifests.push(manifest);
		return manifest;
	}
	resolveSlash(value) {
		if (this.windows)
			value = value.replace(/\//g, "\\");
		return value;
	}
	resolveSource(source) {
		var result = this.resolveVariable(source);
		var slash = result.lastIndexOf(this.slash);
		if (slash < 0) 
			throw new Error("'" + source + "': path not found!");
		var directory = this.resolveDirectoryPath(result.slice(0, slash));
		if (!directory) 
			throw new Error("'" + source + "': directory not found!");
		result = directory + result.slice(slash);
		return result;
	}
	resolveVariable(value) {
		value = value.replace(/\$\(([^\)]+)\)/g, (offset, value) => {
			if (value in this.environment)
				return this.environment[value];
			return this.getenv(value);
		});
		return this.resolveSlash(value);
	}
	run() {
		// merge manifests
		var path = this.manifestPath;
		this.manifests = [];
		this.manifests.already = {};
		var manifest = this.parseManifest(this.manifestPath);
		manifest.directory = this.mainPath;
		this.manifest = {
			config:{},
			creation:{},
			defines:{},
			data:{},
			modules:{},
			resources:{},
			ble:{},
			recipes:{},
			preload:[],
			strip:[],
			commonjs:[],
			errors:[],
			warnings:[],
		};
		this.manifests.forEach(manifest => this.mergeManifest(this.manifest, manifest));
		
		if (this.manifest.errors.length) {
			this.manifest.errors.forEach(error => { this.reportError(null, 0, error); });
			throw new Error("incompatible platform!");
		}
		if (this.manifest.warnings.length) {
			this.manifest.warnings.forEach(warning => { this.reportWarning(null, 0, warning); });
		}
		
		// apply rules
		this.dataFiles = [];
		this.dataFiles.already = {};
		this.dataFolders = [];
		this.dataFolders.already = {};
		
		this.jsFiles = [];
		this.jsFiles.already = {};
		this.jsFolders = [];
		this.jsFolders.already = {};
		
		this.cFiles = [];
		this.cFiles.already = {};
		this.cFolders = [];
		this.cFolders.already = {};
		this.hFiles = [];
		this.hFiles.already = {};
		this.javaFiles = [];
		this.javaFiles.already = {};
		
		this.resourcesFiles = [];
		this.resourcesFiles.already = {};
		this.resourcesFolders = [];
		this.resourcesFolders.already = {};
		
		this.bmpColorFiles = [];
		this.bmpColorFiles.already = {};
		this.bmpAlphaFiles = [];
		this.bmpAlphaFiles.already = {};
		this.bmpFontFiles = [];
		this.bmpFontFiles.already = {};
		this.bmpMaskFiles = [];
		this.bmpMaskFiles.already = {};
		this.clutFiles = [];
		this.clutFiles.already = {};
		this.clutFiles.current = "";
		this.imageFiles = [];
		this.imageFiles.already = {};
		this.soundFiles = [];
		this.soundFiles.already = {};
		this.stringFiles = [];
		this.stringFiles.already = {};
		this.bleServicesFiles = [];
		this.bleServicesFiles.already = {};
		
		var rule = new DataRule(this);
		rule.process(this.manifest.data);
		var rule = new ModulesRule(this);
		rule.process(this.manifest.modules);
		var rule = new ResourcesRule(this);
		rule.process(this.manifest.resources);
		var rule = new BLERule(this);
		rule.process(this.manifest.ble);
	}
}
