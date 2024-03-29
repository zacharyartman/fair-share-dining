/* Each value should be [Name, Individual Cost, Included In Split (T/F)]*/
let values = [];
let extras = 0;
let numPeopleForExtras = 0;
let extrasPerPerson = 0;
let hasCurrency = false;
let individualCost = 0;
let currencySymbol;

/* Each entry should be [UniqueID, Individual cost after conversion excluding extras] */
let uniqueIDs = [];

let table = document.querySelector('table');
let currencyConversion;


document.getElementById('addPerson').onclick = function() {
    if (!hasCurrency) {
        if (!getCurrency()) {
            return;
        }
    }

    let currentExtras = parseFloat(document.getElementById('extras').value);
    let name = document.getElementById('name').value;
    let individualCost = parseFloat(document.getElementById('individual-cost').value);
    console.log(individualCost);
    let includedInExtras = document.getElementById('included-in-extras').checked;
    let valuesToPush = [name, individualCost, includedInExtras];
    values.push(valuesToPush);
    /* update extras if the value changed */
    if (extras != currentExtras && currentExtras > 0) {
        extras = currentExtras;
    }

    if (includedInExtras) {
        numPeopleForExtras++;
        extrasPerPerson = extras/numPeopleForExtras;
    }

    let costAfterSplit = includedInExtras ? ((extrasPerPerson + individualCost) * currencyConversion) : (individualCost * currencyConversion);
    costAfterSplit = parseFloat(costAfterSplit.toFixed(2));

    let included = includedInExtras ? "Yes" : "No";
    do {
        var uniqueID = Math.random();
    } while(uniqueIDs.includes(uniqueID));

    let template = `
        <tr>
        <td>${name}</td>
        <td>${currencySymbol}${individualCost}</td>
        <td>${included}</td>
        <td id = ${uniqueID}>$${costAfterSplit}</td>
        </tr>`;

    table.innerHTML += template;
    if (includedInExtras) {
        uniqueIDs.push([uniqueID, (costAfterSplit - (extrasPerPerson * currencyConversion))]);
    }
    
    updateSplitCosts(extrasPerPerson);
    makeFieldsUneditable();
    resetInputFields();
}

// let enter button work as add button
document.getElementById('individual-cost').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('addPerson').click();
    }
});

function getCurrency() {
    var ele = document.getElementsByName('currency');
 
    for (i = 0; i < ele.length; i++) {
        if (ele[i].checked) {
            currency = ele[i].value;
            hasCurrency = true;
        }
    }

    if(!hasCurrency) {
        alert("Must select a currency");
        return false;
    }

    if (currency == "eur") {
        /* euro to usd */
        currencyConversion = 1.1;
        if (currencySymbol != "\u20AC") {
            currencySymbol = "\u20AC";
            updateCurrencySymbols();        
        }
    }
    else if (currency == "gbp") {
        currencyConversion = 1.27;
        if (currencySymbol != "\u00A3") {
            currencySymbol = "\u00A3";
            updateCurrencySymbols();           
        }
    }
    return true;
}

function updateSplitCosts(newExtrasCost) {
    for (let i = 0; i < uniqueIDs.length; i++) {
        let uniqueID = uniqueIDs[i][0];
        let individualCostExcludingExtras = uniqueIDs[i][1];
        let newValue = parseFloat((individualCostExcludingExtras + (newExtrasCost * currencyConversion)).toFixed(2));
        document.getElementById(uniqueID).innerHTML = `$${newValue}`;
    }

    doVerification();
}

function doVerification() {
    let totalBefore = parseFloat(document.getElementById('total-before').value);
    /* Gets rid of $ and sums up all the rows */
    let totalAfter = Array.from(table.rows).slice(1).reduce((total, row) => {
        let costString = row.cells[3].innerHTML;
        let costNumber = parseFloat(costString.replace(/^\$/, ""));
        return total + costNumber;
    }, 0);
    totalBeforeConverted = totalBefore * currencyConversion;
    document.getElementById('validation-price-before').innerHTML = `${(totalBeforeConverted).toFixed(2)} (${currencySymbol}${totalBefore.toFixed(2)})`;
    document.getElementById('validation-price-after').innerHTML = `${(totalAfter).toFixed(2)} (${currencySymbol}${(totalAfter/currencyConversion).toFixed(2)})`;
    let verificationResult = document.getElementById('verification-result');
    let buffer = 0.02;
    if ((totalAfter - totalBeforeConverted) > buffer) {
        verificationResult.innerHTML = `Error: incorrect pricing. Unexpected extra $${(totalAfter - totalBeforeConverted).toFixed(2)} (${currencySymbol}${((totalAfter/currencyConversion) - totalBefore).toFixed(2)})`;
        verificationResult.style.color = 'red';
    }
    else if ((totalBeforeConverted - totalAfter) > buffer) {
        verificationResult.innerHTML = `Error: incorrect pricing. Missing $${(totalBeforeConverted - totalAfter).toFixed(2)} (${currencySymbol}${(totalBefore - (totalAfter/currencyConversion)).toFixed(2)})`;
        verificationResult.style.color = 'red';
    }
    else {
        verificationResult.innerHTML = 'Verification Succeeded!'
        verificationResult.style.color = 'green';
    }
}

function makeFieldsUneditable() {
    // remove ability to change starting currency
    var radios = document.getElementsByName('currency');

    for(var i = 0; i < radios.length; i++) {
        radios[i].disabled = true;
    }

    // remove ability to change total bill and extras
    document.getElementById('total-before').disabled = true;
    document.getElementById('extras').disabled = true;
}

function resetInputFields() {
    document.getElementById('name').value = "";
    document.getElementById('name').placeholder = "Enter name";
    document.getElementById('individual-cost').value = "";
    document.getElementById('individual-cost').placeholder = "Enter individual cost";
    document.getElementById('name').focus();
}

function updateCurrencySymbols() {
    document.getElementsByName('currency-symbol').forEach(function(element) {
        element.innerHTML = currencySymbol;
    });            
    document.getElementsByName('pseudo-currency-symbol').forEach(function(element) {
        element.innerHTML = '\u00A0\u00A0\u00A0';
    })
}