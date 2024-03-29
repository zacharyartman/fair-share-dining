// format personName : [items]
let persons = {};
// format item : pricePerPerson
let items = {};

let rowCount = 0;
// default starting currency
let originalCurrency = 'usd';
let currencyConversion = 1.0;
let originalCurrencySymbol = "$";

let gratuityPercentage = 0;
let gratuityAmount = 0;
let gratuityMode = 'percentage'; // 'percentage' or 'amount'

document.getElementById('add-person-button').onclick = addPerson;
document.getElementById('calculate-split-button').onclick = onCalculateSplit;
document.getElementById('add-row-button').onclick = addRow;
document.getElementById('remove-row-button').onclick = removeRow;

// hide the header if X button clicked
document.getElementById('close-header').onclick = () => {
    document.querySelector('.new-version-header').style.display = 'none';
    localStorage.setItem('headerClosed', 'true');
}
// if the header has been closed already, don't show it on refresh
if (localStorage.getItem('headerClosed') === 'true') {
    document.querySelector('.new-version-header').style.display = 'none';
}

// if in the name field, clicking enter adds the person
document.getElementById('name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addPerson();
    }
});

// if in the price field, clicking enter adds a new row
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
        name = name.split(' ').join('_');
        persons[name] = [];
        nameInput.value = '';
    
        addOneCheckboxPerRow(name);    
    }
}


function addItemsToItemsList() {
    // format item : price
    items = {};
    let hasError = false;

    for (let row = 1; row < rowCount + 1; row++) {
        let itemName = document.getElementById(`row${row}-item-text-field`).value;
        let itemPrice = parseFloat(document.getElementById(`row${row}-price-field`).value);

        if (itemName in items) {
            alert(`Duplicate item found: ${itemName}. Please remove the duplicate.`);
            hasError = true;
            break;
        }

        if (itemName == "") {
            alert(`Missing item name in row ${row}. Please label the item.`);
            hasError = true;
            break;
        }

        if (isNaN(itemPrice)) {
            alert(`Invalid item price in row ${row}. Please correct the item price.`);
            hasError = true;
            break;
        }

        items[itemName] = itemPrice;
    }

    return !hasError; // Return true if no errors were found
}


// Gets the price of each item per person
function getItemPricePerPerson() {
    // format itemName : pricePerPerson
    let itemPricePerPerson = {};
    for (let itemName in items) {
        let count = 0;
        let price = items[itemName];

        // loop through each person to get a total count of people sharing an item
        for (let personName in persons) {
            if (persons[personName].includes(itemName)) {
                count ++;
            }
        }
        itemPricePerPerson[itemName] = (price) / count;
    }
    return itemPricePerPerson;
}

// gets each person's individual prices owed
function getIndividualPricesOwed() {
    // format personName : amountOwed
    let owedPerPerson = {};
    let itemPricePerPerson = getItemPricePerPerson();
    for (let personName in persons) { 
        let totalOwed = 0;
        // list of items that person has selected
        let personItems = persons[personName];
        for (let i = 0; i < personItems.length; i++) {
            // get each item and add its price per person to the total this person owes
            itemName = personItems[i];
            totalOwed += itemPricePerPerson[itemName];
        }
        owedPerPerson[personName] = totalOwed;
    }
    return owedPerPerson;
}

// gets a string of checkboxes for shared by column
function getCheckBoxesString(row) {
    var checkboxesString = "";
    for (let personName in persons) {
        let checkboxID = `row${row}-${personName}`
        checkboxesString += `<div><input type="checkbox" id="${checkboxID}" name="${personName}">`;
        checkboxesString += `<label for="${checkboxID}">${personName.split('_').join(' ')}</label></div>`;
    }
    return checkboxesString;
}

// creates one checkbox element if a new person is added
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
    label.textContent = personName.split('_').join(' ');

    // Create a container for checkbox and label
    let container = document.createElement('div');
    container.appendChild(checkbox);
    container.appendChild(label);

    return container;
}

// when a new person is added, add a checkbox for them for each existing row
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
    priceSymbolSpan.textContent = originalCurrencySymbol;
    let priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.id = `row${rowCount}-price-field`;
    priceInput.className = 'price-field';
    priceInput.placeholder = 'ex: 35.00';
    priceInput.pattern = "[0-9]*[.,]?[0-9]*";
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
    if (rowCount > 1) {
        document.getElementById(`table-row${rowCount}`).scrollIntoView();
    }
}

function removeRow() {
    // don't let the user remove the first row
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
        return; // return if there is an error.
    }

    for (let personName in persons) {
        // reset list of items
        persons[personName] = [];
    }

    for (let row = 1; row < rowCount + 1; row++) {
        // checks what items each person has selected.
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
    // gets the sum
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
            nameSpan.textContent = personName.split('_').join(' ');            ;
            nameCell.appendChild(nameSpan);

            // create the second column for cost in original currency
            let priceCellOriginalCurrency = document.createElement('td');
            priceCellOriginalCurrency.className = 'owed-price-original-currency';
            let originalPriceSymbolSpan = document.createElement('span');
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
        verificationResult.innerHTML = `&#9888; Error: incorrect pricing. Make sure each item is shared by at least one person.`;
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
    localStorage.setItem('selectedCurrency', currency);
    if (currency == "usd") {
        // only usd
        currencyConversion = 1.0;
        originalCurrencySymbol = "$";
        updateCurrencySymbols();        
    }
    else if (currency == "eur") {
        // euro to usd
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

    // if there is already a totals table, update the currency conversion
    if (document.getElementById("TOTALSUMS-owed")) {
        onCalculateSplit();
    }
}

const currencies = ['usd', 'gbp', 'eur', 'mxn', 'jpy'];

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
// used so that the currency is saved when reloading the site
const savedCurrency = localStorage.getItem('selectedCurrency');
if (savedCurrency) {
    setCurrency(savedCurrency);
    document.getElementById(savedCurrency).checked = true;
} else {
    setCurrency(originalCurrency);
    document.getElementById(originalCurrency).checked = true;
}
updateCurrencySymbols();