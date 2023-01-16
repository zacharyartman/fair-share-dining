"""
Author: Zach Artman
Takes in a file 'listofpricing.txt' consisting of names and prices for a dinner bill in EUROS
Adds the price of Coperto, Wine, and Water to each person's bill
Converts that number into USD
Creates a new text file with updated pricing

Note that if there is more than one person on a line the total will not be calculated correctly.
"""

# Asks the user to input the price of water, coperto, etc.
# Divides the extras by the amount of people to get a price per person to add
extras_pricing = float(input("Enter the total price of Coperto, Water, Wine, etc: "))

# Opens and reads the file and then splits it into a list
prices = open('listofpricing.txt')
list = prices.read()
items = list.split()

# Creates lists for the items and pricing
original_pricing = []
new_pricing = []
new_pricing_usd = []
total_price_euros = 0

eur_to_usd_conversion = 1.1

# If the item is a digit, add it to the list of prices.
for i in range (len(items)):
    if items[i].isdigit():
        original_pricing.append(items[i])

# Divides the total price of the extras by the amount of people on the list
num_to_add = (extras_pricing / len(original_pricing))

# Appends the new pricing in euros to the list new_pricing
for i in range (len(original_pricing)):
    new_pricing.append("%.2f" % (float(original_pricing[i]) + num_to_add))

# Appends the new pricing in USD to the list and replaces the original price
for i in range (len(new_pricing)):
    new_pricing_usd.append("%.2f" % (float(new_pricing[i]) * eur_to_usd_conversion))
    list = list.replace(" " + str(original_pricing[i]), " $" + str(new_pricing_usd[i]))
    total_price_euros += float(new_pricing[i])


total_price_usd = "%.2f" % (float(total_price_euros) * eur_to_usd_conversion)
# Writes a new file with updated pricing
with open('new_pricing.txt', 'w') as file:
  file.write(list)
  file.write("\n")
  file.write("\n")
  file.write("Total price in Euros: €" + "%.2f" % (float(total_price_euros)) + "\n")
  file.write("Total price in USD: $" + str(total_price_usd))

print("Done! New file is called new_pricing.txt")