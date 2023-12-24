# Fair Share Dining

## Introduction
Fair Share Dining is a program I designed to help split expenses fairly when studying or traveling abroad. It features a user-friendly interface for splitting bills and converting foreign currencies to USD, ensuring fair and straightforward bill splitting.

The inspiration for this program came from my experience studying abroad. When we would go out to meals, one person would pay the entire bill with their card. This person then had the task of manually splitting shared expenses such as cover, water, and wine among those who shared them, and adding the cost of individual orders. Finally, they had to convert the total amount from the foreign currency to USD to calculate the amount each person owed. This program quickly does all of that.

## Features
- Supports multiple currencies, currently EUR and GBP.
- Calculates total price of meals, including extras.
- Splits bills among multiple people and includes options for shared extras.
- Provides a validation check after currency conversion.

## How to Set Up
1. Run `index.html`
2. Alternatively go to [zacharyartman.com/fairshare](https://zacharyartman.com/fairshare)

## Usage Instructions
1. **Choose Starting Currency:** Select either EUR or GBP as your starting currency.
2. **Enter Bill Details:** Input the total price of the bill and the cost of any extras.
3. **Add Participants:** Enter the name and individual cost for each person. Mark if they are included in the split for extras.
4. **View Split Details:** The program will display each person's cost after currency conversion and the total cost.
5. **Validation:** After splitting, check the validation section for any discrepancies.

## Technologies Used
- HTML
- CSS
- JavaScript


## Additional Notes
- Currency conversion rates are up to date as of December 24, 2023
- In the future, I hope to connect an API so currency conversion rates are always up to date.
- There is a text file and a python file in the directory. This is because the program initially used text files and the command line, but I revised it to be web-based. 
