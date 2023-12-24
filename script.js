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

    console.log(includedInExtras);
    let costAfterSplit = includedInExtras ? ((extrasPerPerson + individualCost) * currencyConversion) : (individualCost * currencyConversion);
    costAfterSplit = parseFloat(costAfterSplit.toFixed(2));

    let included = includedInExtras ? "Yes" : "No";
    do {
        var uniqueID = Math.random();
    } while(uniqueIDs.includes(uniqueID));

    let template = `
        <tr>
        <td> ${name} </td>
        <td> ${individualCost} </td>
        <td> ${included} </td>
        <td id = ${uniqueID}> $${costAfterSplit} </td>
        </tr>`;

    table.innerHTML += template;
    if (includedInExtras) {
        uniqueIDs.push([uniqueID, (costAfterSplit - (extrasPerPerson * currencyConversion))]);
    }
    updateSplitCosts(extrasPerPerson);
    doVerification();
}

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
            document.getElementsByName('currency-symbol').forEach(function(element) {
                element.innerHTML = currencySymbol;
            });            
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
    totalAfterConverted = totalAfter * currencyConversion;
    document.getElementById('validation-price-before').innerHTML = (totalBeforeConverted).toFixed(2);
    document.getElementById('validation-price-after').innerHTML = (totalAfter).toFixed(2);
    let verificationResult = document.getElementById('verification-result');
    if (totalBeforeConverted < totalAfterConverted) {
        verificationResult.innerHTML = `Error: incorrect pricing. Unexpected extra $${(totalAfterConverted - totalBeforeConverted).toFixed(2)} (${currencySymbol}${(totalAfter - totalBefore).toFixed(2)}`;
        verificationResult.style.color = 'red';
        
    }
    else if (totalBeforeConverted > totalAfterConverted) {
        verificationResult.innerHTML = `Error: incorrect pricing. Missing $${(totalBeforeConverted - totalAfterConverted).toFixed(2)} (${currencySymbol}${(totalBefore - totalAfter).toFixed(2)})`;
        verificationResult.style.color = 'red';
    }
    else {
        verificationResult.innerHTML = 'Verification Succeeded!'
        verificationResult.style.color = 'green';
    }
}