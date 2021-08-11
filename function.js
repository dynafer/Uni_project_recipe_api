function setCategory(type, text) {
    switch(text) {
        case "Breakfast":   case "breakfast":
            return 1;
        case "Lunch":   case "lunch":
            return 2;
        case "Dinner":  case "dinner":
            return 3;
        case "Dessert": case "dessert":
            return 4;
        case "Snack":   case "snack":
            return 5;
        case "Vegetable":   case "vegetable":
            return 6;
        case "Fruit":   case "fruit":
            return 7;
        case "Meat":    case "meat":
            return 8;
        case "Liquid":  case "liquid":
            return 9;
        case "Other":   case "other":
            return 10;
        default:
            if(type === "recipe") {
                return 1;
            } else if(type === "ingredient") {
                return 10;
            } else {
                return 0;
            }
    }
}

function setUnit(unit) {
    switch(unit) {
        case "mm":
            return 1;
        case "ml":
            return 2;
        case "g":
            return 3;
        case "kg":
            return 4;
        case "oz":
            return 5;
        case "unit":
            return 6;
        default:
            return 6;
    }
}

module.exports = {setCategory, setUnit};