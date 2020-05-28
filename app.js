////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////// BUDGET CONTROLLER MODULE ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var budgetController = (function () {
    //variables and methods private to the budgetController
    
    //function constructor to create a new object for every expense
    var Expense = function(id, description, value) 
    {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function(totalIncome)
    {
        if(totalIncome > 0)
        {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else
        {
            this.percentage = -1;
        }
        console.log(this.percentage);
    };

    Expense.prototype.getPercentage = function()
    {
        return this.percentage;
    }

    //function constructor to create a new object for every income
    var Income = function(id, description, value) 
    {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(itemType)
    {
        var sum = 0;

        data.allItems[itemType].forEach(function(current) {
            sum += current.value;
        });

        //store the total income/expense in data structure
        data.totals[itemType] = sum;      
    }

    //data structure to store all the budget data
    var data = {
        allItems : {
            expense: [],
            income: []
        },
        totals : {
            expense: 0,
            income: 0
        },
        budget: 0,
        percentage: -1
    }
    
    //return an object containing public variables and methods
    return {

        //add new item to data structure
        addNewItem: function(itemType, itemDescription, itemValue)
        {
            var newItem, itemID, id;

            //create new ID
            if (data.allItems[itemType].length > 0) {
                itemID = data.allItems[itemType][data.allItems[itemType].length - 1].id + 1;
            } else {
                itemID = 0;
            }

            //create new item
            if(itemType === 'expense') {
                newItem = new Expense(itemID, itemDescription, itemValue);
            }
            else if(itemType === 'income') {
                newItem = new Income(itemID, itemDescription, itemValue);
            }

            // Push it into our data structure
            data.allItems[itemType].push(newItem);
            
            // Return the new element
            return newItem;
        },

        calculateBudget : function()
        {
            // 1. Calculate total income and expenses
            calculateTotal('income');
            calculateTotal('expense');

            // 2. Calculate the budget (income-expenses)
            data.budget = data.totals.income - data.totals.expense;

            // 3. Calculate the percentage of income that we spent
            if(data.totals.income > 0)
            {
                data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
            }
            else
            {
                percentage = -1;
            }
        },

        getBudget : function()
        {
            return {
                budget : data.budget,
                totalIncome : data.totals.income,
                totalExpenses : data.totals.expense,
                percentage : data.percentage
            };
        },

        deleteItem : function(itemType, id)
        {
            var ids, index;
            
            //because in original array, ids will not be in a sequence so we need to determine actual index of the id to be deleted
            //putting all the ids in a new array called ids
            ids = data.allItems[itemType].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1)
            {
                data.allItems[itemType].splice(index, 1);
            }
        },

        calculatePercentages : function()
        {
            data.allItems.expense.forEach(function(current) {
                current.calculatePercentage(data.totals.income);
            });
        },

        getPercentages : function()
        {
            var allPercentages = data.allItems.expense.map(function(current) {
                return current.getPercentage();
            });
            return allPercentages;
        },

        testing: function()
        {
            console.log(data);
        }

    };

})();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////// UI CONTROLLER MODULE /////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var UIController = (function () 
{
    //variables and methods private to the UIController
    var DOMStrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        ExpPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(number, type)
    {
        var numSplit, integerPart, decimalPart;

        //remove the sign
        number = Math.abs(number);
        //set 2 decimal places
        number = number.toFixed(2);

        numSplit = number.split('.');

        integerPart = numSplit[0];
        //to include a comma
        if(integerPart.length > 3)
        {
            integerPart = integerPart.substring(0, integerPart.length - 3) + ',' + integerPart.substring(integerPart.length -3, integerPart.length);
        }

        decimalPart = numSplit[1];

        return (type === 'expense'? '-' : '+') + ' ' + integerPart + '.' + decimalPart;
    };

    //actual foreach method doesn't work for node lists
    //creating a new forEach method for node lists
    var nodeListForEach = function(nodeList, callback)
    {
        for(var i = 0; i < nodeList.length; i++)
        {
            callback(nodeList[i], i);
        }
    };

    //return an object containing public variables and methods
    return {

        //read the input value, type and description from UI
        getInputFields: function() 
        {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // Will be either income or expense
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        //get DOM Strings
        getDOMStrings: function() 
        {
            return DOMStrings;
        },

        //display the newly added item(income/expense) on UI
        addListItem : function(itemObject, itemType)
        {
            var html, newHTML, element;

            // 1. create html string with some placeholder text
            if(itemType === 'income')
            {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i><ion-icon name="close-circle-outline"></ion-icon></i></button></div></div></div>';
            }
            else if(itemType === 'expense')
            {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">---</div><div class="item__delete"><button class="item__delete--btn"><i><ion-icon name="close-circle-outline"></ion-icon></i></button></div></div></div>';
            }
            
            // 2. replace the place holder text with actual data
            newHTML = html.replace('%id%', itemObject.id);
            newHTML = newHTML.replace('%description%', itemObject.description);
            newHTML = newHTML.replace('%value%', formatNumber(itemObject.value, itemType));

            // 3. Insert the html to the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        clearFields: function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ", " + DOMStrings.inputValue);

            //querySelectorAll returns a list, converting into array using call method
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(budgetObject)
        {
            var type;

            budgetObject.budget > 0 ? type = 'income' : type = 'expense';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(budgetObject.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(budgetObject.totalIncome, 'income');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(budgetObject.totalExpenses, 'expense');

            if(budgetObject.percentage > 0)
            {
                document.querySelector(DOMStrings.percentageLabel).textContent = budgetObject.percentage + '%';
            }
        },

        deleteListItems: function(selectorID)
        {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },
         
        displayPercentages: function(percentages)
        {
            var fields = document.querySelectorAll(DOMStrings.ExpPercentageLabel);

            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0)
                {
                    current.textContent = percentages[index] + '%';
                }
            });
        },

        displayMonthAndYear: function()
        {
            var now, month;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DOMStrings.dateLabel).textContent = months[now.getMonth()] + ' ' + now.getFullYear();
        },

        changeFormFocus: function()
        {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );

            nodeListForEach(fields, function(current)
            {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        }
    };

})();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////// GLOBAL APP CONTROLLER MODULE /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Global app controller module which connects budgetController & UIController modules
var controller = (function (budgetCtrlr, UICtrlr) {
    
    //variables and methods private to the controller
    var DOMStringsUI = UICtrlr.getDOMStrings();

    //set up event listeners on initialization
    var setUpEventListeners = function () 
    {
        //add button event listener on mouse click
        document.querySelector(DOMStringsUI.inputBtn).addEventListener('click', ctrlAddItem);

        //add button event listener on "ENTER key event"
        document.addEventListener('keypress', function (event) 
        {
            //check if the pressed key was "ENTER"
            if (event.keyCode === 13 || event.which === 13) 
            {
                ctrlAddItem();
            }
        });

        //delete button event listener on mouse click (by Event Delegation)
        document.querySelector(DOMStringsUI.container).addEventListener('click', ctrlDeleteItem);

        //change event to trigger form focus colors when input type changes
        document.querySelector(DOMStringsUI.inputType).addEventListener('change', UICtrlr.changeFormFocus);
    }

    //function to add new item to the budget list
    var ctrlAddItem = function () 
    {
        var input, newItem;

        //1. Get the input field data
        input = UICtrlr.getInputFields();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0)
        {
            //2. Add the item to the budget controller
            newItem = budgetCtrlr.addNewItem(input.type, input.description, input.value);

            //3. Add the item to UI
            UICtrlr.addListItem(newItem, input.type);

            //4. Clear the fields
            UICtrlr.clearFields();

            //5. Calculate and update budget on UI
            CalcAndUpdateBudget();

            // 6. Calculate and update percentages of list items on UI
            CalcAndUpdatePercentages();
        }
        
    }

    var CalcAndUpdateBudget = function() 
    {

        //1. Calculate Budget
        budgetCtrlr.calculateBudget();

        //2. Return budget
        var budget = budgetCtrlr.getBudget();

        //3. Display Budget on UI
        UIController.displayBudget(budget);
    }

    var ctrlDeleteItem = function(event)
    {
        var itemID, splitID, itemType, id;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID)
        {
            splitID = itemID.split('-');
            itemType = splitID[0];
            id = parseInt(splitID[1]);

            // 1. delete the item from data structure
            budgetCtrlr.deleteItem(itemType, id);

            // 2. delete the item from UI
            UICtrlr.deleteListItems(itemID);

            // 3. update and show the new budget
            CalcAndUpdateBudget();

            // 4. Calculate and update percentages of list items on UI
            CalcAndUpdatePercentages();
        }
    }

    var CalcAndUpdatePercentages = function()
    {
        // 1. calculate percentages
        budgetCtrlr.calculatePercentages();

        // 2. Read percentages from budget controller
        var percentages = budgetCtrlr.getPercentages();

        // 3. update UI
        UICtrlr.displayPercentages(percentages);
    }

    //return an object containing public variables and methods
    return {

        //initialization function
        initialize : function() 
        {
            console.log('Application has started');
            setUpEventListeners();
            UICtrlr.displayMonthAndYear();
        }
    };
})(budgetController, UIController);

//initialize the app controller on load
controller.initialize();