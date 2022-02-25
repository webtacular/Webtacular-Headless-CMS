import _ from "lodash";

export default function (context:any) {
    let values:any = {};

    // Recursive function to get the values out of the Context object
    let getValues = (selection:any, parentObj:string[], prev:any) => {
        // Loop through the selection, there might be multiple selections
        selection.map((selection:any) => {

            // Check for a nested selection set
            if(selection.selectionSet?.selections !== undefined)
                // If the selection is nested
                return getValues(selection?.selectionSet?.selections, [...parentObj, selection?.name?.value], selection);

            let parameters:{[key:string]: string | number} = {};

            // Loop through the arguments
            for(let i = 0; i < prev?.arguments.length; i++) {
                if(prev?.arguments[i]) parameters[prev?.arguments[i].name.value] = prev?.arguments[i].value.value
            }

            // Create a temporary object
            let temp:any = {};

            for(let i = parentObj.length; i >= 0; i--) {
                // Set the parameters in the object
                if(parentObj[i] === undefined)
                    temp[parentObj[i-1]] = parameters;

                // i + 1 because we want to skip the first element,
                // It would be a dubplicate of the first element
                else if(i + 1 < parentObj.length) { 
                    let clone:any = temp; // Clone the object
                    temp = {};  // Reset the temp object
                    temp[parentObj[i]] = clone; // Add the previous object to the temp object
                }
            }

            // Merge the two objects
            _.merge(values, temp);
        });
    }

    // Start the recursive function
    getValues(context.operation.selectionSet.selections, [], {});

    // Return the values
    return values;
}