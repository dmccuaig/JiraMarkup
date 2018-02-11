document.addEventListener("DOMContentLoaded", function () {

    var taInput;
    var cbHasHeaders;
    var tbInput;
    var taOutput;

    function getDelimiter() {
        var delimiter = document.querySelector('input[name="_delimitType"]:checked').value;
        if (delimiter === "")
            delimiter = tbInput.value.trim();
        return delimiter;
    };

    function getInput() { return taInput.value.trim(); }
    function setOutput(output) {
        taOutput.value = output;
        taOutput.select();
    }

    function getHasHeaders() { return cbHasHeaders.checked; }

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
        var rowStart;
        var i, j;

        if (hasHeaders) {
            firstRow = table[0];
            rowStart = 1;
        }
        else {
            firstRow = Array(table[0].length);
            for (i = 0; i < firstRow.length; i++) {
                firstRow[i] = "Column" + i;
            }
            rowStart = 0;
        }

        var output = "";

        for (i = 0; i < firstRow.length; i++) {
            output += "||" + firstRow[i];
        }
        output += "||\n";

        for (i = rowStart; i < table.length; i++) {
            for (j = 0; j < table[i].length; j++) {
                output += "|" + table[i][j];
            }
            output += "|\n";
        }

        return output;
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

        var table = parseText(input, delimiter);
        var output = makeMarkup(table, getHasHeaders());
        setOutput(output);
    };

    function onCopyClicked() {
        document.execCommand('copy');
    }

    function setupInput(id, evt) {
        var ctl = document.getElementById(id);
        ctl.addEventListener(evt, makeTable);
        return ctl;
    };

    taInput = setupInput('_input', 'input');
    cbHasHeaders = setupInput('_hasHeaders', 'change');
    setupInput('_tab', 'change');
    setupInput('_comma', 'change');
    setupInput('_other', 'change');
    tbInput = setupInput('_delimiter', 'input');
    taOutput = document.getElementById('_output');

    document.getElementById('_copy').addEventListener('click', onCopyClicked);

});
