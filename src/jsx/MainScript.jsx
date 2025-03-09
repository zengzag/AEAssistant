/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2014 Adobe Inc.
* All Rights Reserved.
*
* NOTICE: Adobe permits you to use, modify, and distribute this file in
* accordance with the terms of the Adobe license agreement accompanying
* it. If you have received this file from a source other than Adobe,
* then your use, modification, or distribution of it requires the prior
* written permission of Adobe. 
**************************************************************************/
if (!$._ext) {
    $._ext = {};
}
//  Evaluate a file and catch the exception.
$._ext.evalFile = function (path) {
    try {
        $.evalFile(path);
    } catch (e) { alert("Exception:" + e); }
};

// Evaluate all the files in the given folder 
$._ext.evalFiles = function (jsxFolderPath) {
    var folder = new Folder(jsxFolderPath);
    if (folder.exists) {
        var jsxFiles = folder.getFiles("*.jsx");
        for (var i = 0; i < jsxFiles.length; i++) {
            var jsxFile = jsxFiles[i];
            $._ext.evalFile(jsxFile);
        }
    }
};

