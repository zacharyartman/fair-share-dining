// format personName : [items]
let persons = {};
// format item : pricePerPerson
let items = {};

let rowCount = 0;
// default starting currency
let originalCurrency = 'eur';
let currencyConversion = 1.1;
let originalCurrencySymbol = "\u20AC";

let gratuityPercentage = 0;
let gratuityAmount = 0;
let gratuityMode = 'percentage'; // 'percentage' or 'amount'


document.getElementById('add-person-button').onclick = addPerson;
document.getElementById('calculate-split-button').onclick = onCalculateSplit;
document.getElementById('add-row-button').onclick = addRow;
document.getElementById('remove-row-button').onclick = removeRow;

document.getElementById('close-header').onclick = () => {
    document.querySelector('.new-version-header').style.display = 'none';
}

document.getElementById('name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addPerson();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.target.matches('.price-field') && e.key === 'Enter') {
        addRow();
        document.getElementById(`row${rowCount}-item-text-field`).focus();
    }
});



function addPerson() {
    let nameInput = document.getElementById("name");
    let name = nameInput.value;
    if (name in persons) {
        alert("Name Already Added");
    }
    else if (name == "") {
        alert("Please enter a name.");
    }
    else {
        persons[name] = [];
        nameInput.value = '';
    
        addOneCheckboxPerRow(name);    
    }
}

function addItemsToItemsList() {
    // format item : price
    items = {};
    let hasDuplicates = false;

    for (let row = 1; row < rowCount + 1; row++) {
        let itemName = document.getElementById(`row${row}-item-text-field`).value;
        let itemPrice = parseFloat(document.getElementById(`row${row}-price-field`).value);

        if (itemName in items) {
            alert(`Duplicate item found: ${itemName}. Please remove the duplicate.`);
            hasDuplicates = true;
            break;
        }

        items[itemName] = itemPrice;
    }

    return !hasDuplicates; // Return true if no duplicates were found
}


// WORKS
function getItemPricePerPerson() {
    let itemPricePerPerson = {};
    for (let itemName in items) {
        let count = 0;
        let price = items[itemName];

        for (let personName in persons) {
            if (persons[personName].includes(itemName)) {
                count ++;
            }
        }
        itemPricePerPerson[itemName] = (price) / count;
    }
    return itemPricePerPerson;
}

// WORKS
function getIndividualPricesOwed() {
    // format personName : amountOwed
    let owedPerPerson = {};
    let itemPricePerPerson = getItemPricePerPerson();
    for (let personName in persons) { 
        let totalOwed = 0;
        let personItems = persons[personName];
        for (let i = 0; i < personItems.length; i++) {
            itemName = personItems[i];
            totalOwed += itemPricePerPerson[itemName];
        }
        owedPerPerson[personName] = totalOwed;
    }
    return owedPerPerson;
}

function getCheckBoxesString(row) {
    var checkboxesString = "";
    for (let personName in persons) {
        let checkboxID = `row${row}-${personName}`
        checkboxesString += `<div><input type="checkbox" id="${checkboxID}" name="${personName}">`;
        checkboxesString += `<label for="${checkboxID}">${personName}</label></div>`;
    }
    return checkboxesString;
}

function getOneCheckboxElement(personName, row) {
    let checkboxID = `row${row}-${personName}`;

    // Create checkbox input
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = checkboxID;
    checkbox.name = personName;

    // Create label
    let label = document.createElement('label');
    label.htmlFor = checkboxID;
    label.textContent = personName;

    // Create a container for checkbox and label
    let container = document.createElement('div');
    container.appendChild(checkbox);
    container.appendChild(label);

    return container;
}

function addOneCheckboxPerRow(personName) {
    for (let row = 1; row < rowCount + 1; row++) {
        let container = getOneCheckboxElement(personName, row);
        document.getElementById(`row${row}-shared-by`).appendChild(container);
    }
}

function addRow() {
    rowCount++;
    let rowID = `table-row${rowCount}`;

    const receiptTableBody = document.querySelector('.receipt-section table');
    // create row in the table
    let newRow = document.createElement('tr');
    newRow.id = rowID;

    // create an input for name with id = rowrowCount-item-text-field
    let itemNameCell = document.createElement('td');
    itemNameCell.className = 'item';
    let itemNameInput = document.createElement('input');
    itemNameInput.type = 'text';
    itemNameInput.className = 'item-text-field';
    itemNameInput.placeholder = 'ex: Filet Mignon';
    itemNameInput.id = `row${rowCount}-item-text-field`;
    itemNameCell.appendChild(itemNameInput);

    // create an input for price = rowrowCount-price-field
    let priceCell = document.createElement('td');
    priceCell.className = 'price';
    let priceContainer = document.createElement('div');
    priceContainer.className = 'price-input-container';

    let priceSymbolSpan = document.createElement('span');
    priceSymbolSpan.className = 'currency-symbol';
    // TODO: CHANGE TO EURO/CURRENCY SYMBOL
    priceSymbolSpan.textContent = originalCurrencySymbol;
    let priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.id = `row${rowCount}-price-field`;
    priceInput.className = 'price-field'
    priceInput.placeholder = 'ex: 35.00';
    priceInput.pattern = "\\d*"; 
    priceInput.inputmode = "decimal";
    priceContainer.appendChild(priceSymbolSpan);
    priceContainer.appendChild(priceInput);
    priceCell.appendChild(priceContainer);
    // add the checkboxes
    let sharedByCell = document.createElement('td');
    sharedByCell.className = 'shared-by';
    sharedByCell.id = `row${rowCount}-shared-by`;
    sharedByCell.innerHTML = getCheckBoxesString(rowCount);

    newRow.appendChild(itemNameCell);
    newRow.appendChild(priceCell);
    newRow.appendChild(sharedByCell);

    receiptTableBody.appendChild(newRow);
}

function removeRow() {
    if (rowCount > 1) {
        let rowID = `table-row${rowCount}`;
        let rowElement = document.getElementById(rowID);
        if (rowElement) {
            rowElement.parentNode.removeChild(rowElement);
        }    

        rowCount --;
    }
}

function onCalculateSplit() {
    // add all the items to the list
    if (!addItemsToItemsList()) {
        return; // return if theres a dupe.
    }

    for (let personName in persons) {
        // reset list of items
        persons[personName] = [];
    }

    for (let row = 1; row < rowCount + 1; row++) {
        for (let personName in persons) {
            let checkboxID = `row${row}-${personName}`
            let selector = `#${checkboxID}:checked`;
            let isChecked = document.querySelector(selector) !== null;
            
            if (isChecked) {
                // get item name of that row
                itemName = document.getElementById(`row${row}-item-text-field`).value;
                // add the item to that person's list
                persons[personName].push(itemName);
            }         
        }
    }
    // get all individual prices owed, then display it
    let owedPerPerson = getIndividualPricesOwed();
    let totalBill = Object.values(owedPerPerson).reduce((a, b) => a + b, 0);

    if (gratuityMode === 'percentage') {
        // Apply gratuity as a percentage
        gratuityPercentage = parseFloat(document.getElementById('gratuity-percentage').value) || 0;
        for (let person in owedPerPerson) {
            let gratuityForPerson = owedPerPerson[person] * (gratuityPercentage / 100);
            owedPerPerson[person] += gratuityForPerson;
        }
    } else {
        gratuityAmount = parseFloat(document.getElementById('gratuity-amount').value) || 0;
        // Convert the fixed gratuity amount into a percentage of the total bill
        let gratuityBillPercentage = (gratuityAmount / totalBill) * 100;

        // Apply this percentage to each person's share
        for (let person in owedPerPerson) {
            let gratuityForPerson = owedPerPerson[person] * (gratuityBillPercentage / 100);
            owedPerPerson[person] += gratuityForPerson;
        }
    }

    const owedTableBody = document.querySelector('.owed-section table');
    for (let personName in persons) {
        let rowID = `${personName}-owed-row`;
        if (!document.getElementById(rowID)) {
            let newRow = document.createElement('tr');
            newRow.id = rowID;

            // create the first column for name
            let nameCell = document.createElement('td');
            nameCell.className = 'name-cell';
            let nameSpan = document.createElement('span');
            nameSpan.textContent = personName;
            nameCell.appendChild(nameSpan);

            // create the second column for cost in original currency
            let priceCellOriginalCurrency = document.createElement('td');
            priceCellOriginalCurrency.className = 'owed-price-original-currency';
            let originalPriceSymbolSpan = document.createElement('span');
            // TODO: CHANGE TO EURO/CURRENCY SYMBOL
            originalPriceSymbolSpan.className = 'currency-symbol';
            originalPriceSymbolSpan.textContent = originalCurrencySymbol;
            let originalPriceSpan = document.createElement('span');
            originalPriceSpan.id = `${personName}-owed-original`;
            originalPriceSpan.textContent = owedPerPerson[personName].toFixed(2);
            priceCellOriginalCurrency.appendChild(originalPriceSymbolSpan);
            priceCellOriginalCurrency.appendChild(originalPriceSpan);

            // create the third column for cost in USD

            let priceCellUSD = document.createElement('td');
            priceCellUSD.className = 'owed-price-usd';
            let USDPriceSymbolSpan = document.createElement('span');
            // TODO: CHANGE TO UPDATED CURRENCY SYMBOL
            USDPriceSymbolSpan.textContent = '$'
            let USDPriceSpan = document.createElement('span');
            USDPriceSpan.id = `${personName}-owed-usd`;
            USDPriceSpan.textContent = convertCurrency(owedPerPerson[personName]).toFixed(2);
            priceCellUSD.appendChild(USDPriceSymbolSpan);
            priceCellUSD.appendChild(USDPriceSpan);

        
            newRow.appendChild(nameCell);
            newRow.appendChild(priceCellOriginalCurrency);
            newRow.appendChild(priceCellUSD);
    
            owedTableBody.appendChild(newRow); 
        // if the table already exists, just update the prices   
        } else {
            document.getElementById(`${personName}-owed-original`).textContent = owedPerPerson[personName].toFixed(2);
            document.getElementById(`${personName}-owed-usd`).textContent = convertCurrency(owedPerPerson[personName]).toFixed(2);
        }
    }    

    displayTotals(owedPerPerson);

}

function displayTotals(owedPerPerson) {

    let totalOwed = 0;
    let totalAccountedFor = 0;

    for (let key in owedPerPerson) {
        totalAccountedFor += owedPerPerson[key];
    }
    for (let key in items) {
        totalOwed += items[key];
    }

    let rowID = "TOTALSUMS-owed";
    const owedTableBody = document.querySelector('.owed-section table');

    if (document.getElementById(rowID)) {
        let rowElement = document.getElementById(rowID);
        if (rowElement) {
            rowElement.parentNode.removeChild(rowElement);
        }
    }
    
    let newRow = document.createElement('tr');
    newRow.id = rowID;

    // create the first column for name
    let nameCell = document.createElement('td');
    nameCell.className = 'name-cell';
    let nameSpan = document.createElement('span');
    nameSpan.textContent = "TOTAL";
    nameSpan.style.fontWeight = 'bold'; 
    nameCell.appendChild(nameSpan);

    // create the second column for cost in original currency
    let priceCellOriginalCurrency = document.createElement('td');
    priceCellOriginalCurrency.className = 'owed-price-original-currency';
    let originalPriceSymbolSpan = document.createElement('span');
    // TODO: CHANGE TO EURO/CURRENCY SYMBOL
    originalPriceSymbolSpan.className = 'currency-symbol';
    originalPriceSymbolSpan.textContent = originalCurrencySymbol;
    let originalPriceSpan = document.createElement('span');
    originalPriceSpan.textContent = totalAccountedFor.toFixed(2);
    originalPriceSpan.style.fontWeight = 'bold';
    priceCellOriginalCurrency.appendChild(originalPriceSymbolSpan);
    priceCellOriginalCurrency.appendChild(originalPriceSpan);

    // create the third column for cost in USD

    let priceCellUSD = document.createElement('td');
    priceCellUSD.className = 'owed-price-usd';
    let USDPriceSymbolSpan = document.createElement('span');
    // TODO: CHANGE TO UPDATED CURRENCY SYMBOL
    USDPriceSymbolSpan.textContent = '$';
    let USDPriceSpan = document.createElement('span');
    USDPriceSpan.textContent = convertCurrency(totalAccountedFor).toFixed(2);
    USDPriceSpan.style.fontWeight = 'bold';
    priceCellUSD.appendChild(USDPriceSymbolSpan);
    priceCellUSD.appendChild(USDPriceSpan);


    newRow.appendChild(nameCell);
    newRow.appendChild(priceCellOriginalCurrency);
    newRow.appendChild(priceCellUSD);

    owedTableBody.appendChild(newRow); 

    let buffer = 0.02;
    let verificationResult = document.getElementById('unaccounted-for-text');

    if ((totalOwed - totalAccountedFor) > buffer) {
        verificationResult.innerHTML = `&#9888; Error: incorrect pricing. Missing $${convertCurrency(totalOwed - totalAccountedFor).toFixed(2)} (${originalCurrencySymbol}${(totalOwed - (totalAccountedFor/currencyConversion)).toFixed(2)})`;
        verificationResult.style.color = 'red';
        newRow.style.backgroundColor = 'red';
        verificationResult.style.display = 'block';
    }
    else {
        verificationResult.innerHTML = '&#10003; Verification Succeeded!'
        verificationResult.style.color = 'green';
        newRow.style.backgroundColor = 'lightgreen';
        verificationResult.style.display = 'block';
    }

}

function convertCurrency(oldPrice) {
    return parseFloat((oldPrice * currencyConversion).toFixed(2));
}

function setCurrency(currency) {
    if (currency == "eur") {
        /* euro to usd */
        currencyConversion = 1.1;
        originalCurrencySymbol = "\u20AC";
        updateCurrencySymbols();        
    }
    else if (currency == "gbp") {
        currencyConversion = 1.27;
        originalCurrencySymbol = "\u00A3";
        updateCurrencySymbols();           
    }
    else if (currency == "mxn") {
        currencyConversion = 0.059;
        originalCurrencySymbol = "MX$";
        updateCurrencySymbols();           
    }
    else if (currency == "jpy") {
        currencyConversion = 0.0071;
        originalCurrencySymbol = "\u00A5";
        updateCurrencySymbols();           
    }
}

const currencies = ['gbp', 'eur', 'mxn', 'jpy'];

currencies.forEach(currency => {
    document.getElementById(currency).addEventListener('click', () => {
        setCurrency(currency);
    });
});

function updateCurrencySymbols() {
    document.querySelectorAll('.currency-symbol').forEach((element) => {
        element.innerHTML = originalCurrencySymbol;
    });           
    document.getElementById("gratuity-amount").placeholder = originalCurrencySymbol; 
}

document.getElementById('gratuity-percentage-option').addEventListener('change', function() {
    gratuityMode = 'percentage';
    document.getElementById('gratuity-percentage').disabled = false;
    document.getElementById('gratuity-amount').disabled = true;
});

document.getElementById('gratuity-amount-option').addEventListener('change', function() {
    gratuityMode = 'amount';
    document.getElementById('gratuity-amount').disabled = false;
    document.getElementById('gratuity-percentage').disabled = true;
});

function applyGratuity() {
    if (gratuityMode === 'percentage') {
        gratuityPercentage = parseFloat(document.getElementById('gratuity-percentage').value) || 0;
    } else {
        gratuityAmount = parseFloat(document.getElementById('gratuity-amount').value) || 0;
    }
    onCalculateSplit(); // Recalculate the split including gratuity
}


// ADD ONE ROW ON INITIALIZATION
addRow();
setCurrency(originalCurrency);
updateCurrencySymbols();