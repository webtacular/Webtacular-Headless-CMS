import _ from "lodash";

export default function (context:any) {
    let filter:any = {};

    let getValues = (selection:any, parentObj?:string[]) => {
        selection.map((selection:any) => {
            // Check if the parentObj is defined
            if(parentObj)
                // Merge the two objects
                _.merge(filter, [...parentObj, null].reduceRight((obj, next) => {
                    if(next === null) return ({[selection.name?.value]: 1});
                    return ({[next]: obj});
                }, {}));

            // Check for a nested selection set
            if(selection.selectionSet?.selections !== undefined){
                // If the selection has a selection set, then we need to recurse
                if(!parentObj) getValues(selection.selectionSet?.selections, [selection.name.value]);

                // If the selection is nested
                else getValues(selection.selectionSet?.selections, [...parentObj, selection.name.value]);
            }
        });
    }

    // Start the recursive function
    getValues(context.operation.selectionSet.selections);

    return filter;
}