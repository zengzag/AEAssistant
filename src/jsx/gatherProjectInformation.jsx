if (!$._zag) {
    $._zag = {};
}

function covertBlendingMode(mode) {
    switch (mode) {
        case BlendingMode.ADD:
            return "Add";
        case BlendingMode.ALPHA_ADD:
            return "AlphaAdd";
        case BlendingMode.CLASSIC_COLOR_BURN:
            return "ClassicColorBurn";
        case BlendingMode.CLASSIC_COLOR_DODGE:
            return "ClassicColorDodge";
        case BlendingMode.CLASSIC_DIFFERENCE:
            return "ClassicDifference";
        case BlendingMode.COLOR:
            return "Color";
        case BlendingMode.COLOR_BURN:
            return "ColorBurn";
        case BlendingMode.COLOR_DODGE:
            return "ColorDodge";
        case BlendingMode.DANCING_DISSOLVE:
            return "DancingDissolve";
        case BlendingMode.DARKEN:
            return "Darken";
        case BlendingMode.DARKER_COLOR:
            return "DarkerColor";
        case BlendingMode.DIFFERENCE:
            return "Difference";
        case BlendingMode.DISSOLVE:
            return "Dissolve";
        case BlendingMode.DIVIDE:
            return "Divide";
        case BlendingMode.EXCLUSION:
            return "Exclusion";
        case BlendingMode.HARD_LIGHT:
            return "HardLight";
        case BlendingMode.HARD_MIX:
            return "HardMix";
        case BlendingMode.HUE:
            return "Hue";
        case BlendingMode.LIGHTEN:
            return "Lighten";
        case BlendingMode.LIGHTER_COLOR:
            return "LighterColor";
        case BlendingMode.LINEAR_BURN:
            return "LinearBurn";
        case BlendingMode.LINEAR_DODGE:
            return "LinearDodge";
        case BlendingMode.LINEAR_LIGHT:
            return "LinearLight";
        case BlendingMode.LUMINESCENT_PREMUL:
            return "LuminescentPremul";
        case BlendingMode.LUMINOSITY:
            return "Luminosity";
        case BlendingMode.MULTIPLY:
            return "Multiply";
        case BlendingMode.NORMAL:
            return "Normal";
        case BlendingMode.OVERLAY:
            return "Overlay";
        case BlendingMode.PIN_LIGHT:
            return "PinLight";
        case BlendingMode.SATURATION:
            return "Saturation";
        case BlendingMode.SCREEN:
            return "Screen";
        case BlendingMode.SUBTRACT:
            return "Subtract";
        case BlendingMode.SILHOUETE_ALPHA:
            return "SilhoueteAlpha";
        case BlendingMode.SILHOUETTE_LUMA:
            return "SilhouetteLuma";
        case BlendingMode.SOFT_LIGHT:
            return "SoftLight";
        case BlendingMode.STENCIL_ALPHA:
            return "StencilAlpha";
        case BlendingMode.STENCIL_LUMA:
            return "StencilLuma";
        case BlendingMode.VIVID_LIGHT:
            return "VividLight";
    }
    return "Invalid";
}

function getLayerType(layer) {
    switch (layer.matchName) {
        case "ADBE Vector Layer":
        case "ADBE Text Layer":
        case "ADBE Camera Layer":
        case "ADBE Light Layer":
            return layer.matchName;
        case "ADBE AV Layer":
            if (layer.nullLayer === true) {
                return "Null";
            } else if (layer.adjustmentLayer === true) {
                return "Adjustment";
            } else if (layer.guideLayer === true) {
                return "Guide";
            } else if (layer.source instanceof CompItem) {
                return "Precomp";
            } else if (layer.source.mainSource instanceof SolidSource) {
                return "Solid";
            } else if (layer.source.mainSource instanceof PlaceholderSource) {
                return "Placeholder";
            } else if (layer.source.mainSource instanceof FileSource) {
                if (layer.source.footageMissing == true) {
                    return "Missing Footage";
                }
                var priorLayerState = layer.enabled;
                layer.enabled = true;
                var importIsData = layer.enabled == false;
                layer.enabled = priorLayerState;
                if (importIsData) {
                    return "Data";
                }
                if (!layer.source.hasVideo && layer.source.hasAudio) {
                    return "Audio";
                }
                if (layer.source.mainSource.nativeFrameRate === 0) {
                    return "Image";
                } else {
                    var ext = layer.source.name.split('.').pop().toLowerCase();
                    if (ext === 'mp4' || ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
                        if (ext === 'mp4') {
                            return "Video";
                        }
                        return "Sequence";
                    }
                }
            }
    }
    return "Unknown";
}

$._zag.gatherProjectInformation = function () {
    var projectInfo = {
        projectPath: "",
        comps: []
    };

    try {
        var project = app.project;
        
        if (!project) {
            return null;
        }

        if (project.file)
            projectInfo.projectPath = project.file.fsName;

        var numComps = project.items.length;
        for (var i = 1; i <= numComps; i++) {
            var compItem = project.items[i];
            
            if (compItem instanceof CompItem) {
                var width = compItem.width ? Math.round(compItem.width) : 0;
                var height = compItem.height ? Math.round(compItem.height) : 0;

                var compInfo = {
                    id: compItem.id,
                    selected: compItem.selected,
                    name: compItem.name,
                    resolution: width + "x" + height,
                    frameRate: (compItem.frameRate || 0) + " fps",
                    duration: compItem.duration,
                    layers: []
                };

                var numLayers = compItem.layers.length;
                for (var j = 1; j <= numLayers; j++) {
                    var layer = compItem.layers[j];
                    
                    var layerInfo = {
                        name: layer.name,
                        index: layer.index,
                        blendingMode: covertBlendingMode(layer.blendingMode),
                        duration: [
                            [layer.inPoint, layer.outPoint]
                        ],
                        layerSize: {
                            "width": layer.width,
                            "height": layer.height
                        },
                        layerType: getLayerType(layer),
                        effects: []
                    };

                    if (layer.Effects !== undefined && layer.Effects !== null)
                    {
                        for (var k = 1; k <= layer.Effects.numProperties; k++) {
                            var effect = layer.Effects.property(k);
                            layerInfo.effects.push({
                                name: effect.name,
                                matchName: effect.matchName,
                                enabled: effect.enabled,
                                index: k
                            });
                        }
                    }
                    
                    compInfo.layers.push(layerInfo);
                }

                projectInfo.comps.push(compInfo);
            }
        }
        
        return projectInfo;

    } catch (error) {
        return null;
    }
}
