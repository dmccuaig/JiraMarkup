document.addEventListener("DOMContentLoaded", function () {

    var taInput;
    var cbHasHeaders;
    var tbInput;
    var taOutput;
    var cbShowPreview;
    var divPreview;

    function getDelimiter() {
        var delimiter = document.querySelector('input[name="_delimitType"]:checked').value;
        if (delimiter === "")
            delimiter = tbInput.value.trim();
        return delimiter;
    }

    function getInput() { return taInput.value.trim(); }
    function setOutput(output) {
        taOutput.value = output;
    }

    function getHasHeaders() { return cbHasHeaders.checked; }
    function getShowPreview() { return cbShowPreview.checked; }

    function parseText(input, delimiter) {
        var config = {
            delimiter: delimiter,
            skipEmptyLines: true
        };

        return Papa.parse(input, config).data;
    }

    function makeMarkup(table, hasHeaders) {
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
    }


    function setPreview(data, hasHeaders) {

        options = {
            th: hasHeaders,
            thead: hasHeaders,
            attrs: { border : "1"}
    };

        divPreview.innerHTML = null;
        var htmlTable = arrayToTable(data, options);
        $("#_preview").append(htmlTable);
    }

    function clearPreview() {
        divPreview.innerHTML = null;
    }

    function saveChoices() {
        var choices = {
            version: 1,
            hasHeaders: $("#_hasHeaders").is(":checked"),
            delimiter: getDelimiter(),
            preview: $("#_showPreview").is(":checked"),
        };
        chrome.storage.sync.set(choices);
    }

    function restoreChoices(choices) {
        if(choices.hasHeaders)
            $("#_hasHeaders").prop("checked", choices.hasHeaders);
        if(choices.preview)
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
    }

    function makeTable() {
        var input = getInput();
        if (input.length === 0) {
            taOutput.value = "No input";
            return;
        }

        var delimiter = getDelimiter();
        if (delimiter === "") {
            taOutput.value = "No delimiter";
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
    }

    function onCopyClicked() {
        taOutput.select();
        document.execCommand('copy');
    }

    function setupInput(id, evt) {
        var ctl = document.getElementById(id);
        ctl.addEventListener(evt, makeTable);
        return ctl;
    }

    taInput = setupInput('_input', 'input');
    cbHasHeaders = setupInput('_hasHeaders', 'change');
    cbShowPreview = setupInput('_showPreview', 'change');
    setupInput('_tab', 'change');
    setupInput('_comma', 'change');
    setupInput('_other', 'change');
    tbInput = setupInput('_delimiter', 'input');
    taOutput = document.getElementById('_output');
    divPreview = document.getElementById("_preview");

    document.getElementById('_copy').addEventListener('click', onCopyClicked);

    chrome.storage.sync.get(null, restoreChoices);
});
