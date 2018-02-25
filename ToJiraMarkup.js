var getInput = () => $("#_input").val().trim();
var isChecked = id => $("#" + id).is(":checked");
var setOutput = (output) => $("#_output").val(output);
var getHasHeaders = () => isChecked("_hasHeaders");
var getShowPreview = () => isChecked("_showPreview");

var getDelimiter = () => {
    var delimiter = $('input[name="_delimitType"]:checked').val();
    if (delimiter === "")
        delimiter = $("#_delimiter").val().trim();
    return delimiter;
};

var parseText = (input, delimiter) => {
    var config = {
        delimiter: delimiter,
        skipEmptyLines: true
    };

    return Papa.parse(input, config).data;
};

var clearPreview = () => $("#_preview").empty();
var setPreview = (data, hasHeaders) => {

    options = {
        th: hasHeaders,
        thead: hasHeaders,
        attrs: { border: "1" }
    };
    clearPreview();
    var htmlTable = arrayToTable(data, options);
    $("#_preview").append(htmlTable);
};

var makeMarkup = (table, hasHeaders) => {
    if (table.length === 0) return "";

    var firstRow;
    var i, j;

    if (!hasHeaders) {
        firstRow = Array(table[0].length);
        for (i = 0; i < firstRow.length; i++) {
            firstRow[i] = "Column" + i;
        }
        table.unshift(firstRow);
    }

    var output = "";
    firstRow = table[0];
    for (i = 0; i < firstRow.length; i++) {
        output += "||" + firstRow[i];
    }
    output += "||\n";

    for (i = 1; i < table.length; i++) {
        for (j = 0; j < table[i].length; j++) {
            output += "|" + table[i][j];
        }
        output += "|\n";
    }

    return output;
};

var saveChoices = () => {
    var choices = {
        version: 1,
        hasHeaders: $("#_hasHeaders").is(":checked"),
        delimiter: getDelimiter(),
        preview: $("#_showPreview").is(":checked")
    };
    chrome.storage.sync.set(choices);
};

var restoreChoices = (choices) => {
    if (choices.hasHeaders)
        $("#_hasHeaders").prop("checked", choices.hasHeaders);
    if (choices.preview)
        $("#_showPreview").prop("checked", choices.preview);
    if (choices.delimiter) {
        if (choices.delimiter === ",")
            $("#_comma").prop("checked", true);
        else if (choices.delimiter === "\t")
            $("#_tab").prop("checked", true);
        else {
            $("#_other").prop("checked", true);
            $("#_delimiter").val(choices.delimiter);
        }
    }
};

var makeTable = () => {
    var input = getInput();
    if (input.length === 0) {
        setOutput("No input");
        return;
    }

    var delimiter = getDelimiter();
    if (delimiter === "") {
        setOutput("No delimiter");
        return;
    }

    saveChoices();

    var table = parseText(input, delimiter);
    var hasHeaders = getHasHeaders();
    var output = makeMarkup(table, hasHeaders);

    setOutput(output);

    if (getShowPreview())
        setPreview(table, hasHeaders);
    else
        clearPreview();
};

$(document).ready(() => {
    $("#_input").on('input', makeTable);
    $("#_hasHeaders").change(makeTable);
    $("#_showPreview").change(makeTable);
    $("#_tab").change(makeTable);
    $("#_comma").change(makeTable);
    $("#_other").change(makeTable);
    $("#_delimiter").on("input", makeTable);

    $("#_copy").click(() => {
        document.getElementById('_output').select();
        document.execCommand('copy');
    });

    chrome.storage.sync.get(null, restoreChoices);
});
