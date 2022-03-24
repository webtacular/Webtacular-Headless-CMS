import _ from "lodash";

export default (context:any) => {
    let filter:any = {};

    const recurse = (selection:any, parentObj?:string[]) => {
        // selection.map((new_selection:any) => {
        //     console.log(selection);

        //     // Check if the parentObj is defined
        //     if(parentObj)
        //         // Merge the two objects
        //         _.merge(filter, [...parentObj, null].reduceRight((obj, next) => {
        //             if(next === null) return ({[new_selection.name?.value]: 1});
        //             return ({[next]: obj});
        //         }, {}));

        //     // Check for a nested selection set
        //     if(new_selection.selectionSet?.selections !== undefined){
        //         // If the selection has a selection set, then we need to recurse
        //         if(!parentObj) getValues(new_selection.selectionSet?.selections, [new_selection.name.value]);

        //         // If the selection is nested
        //         else getValues(new_selection.selectionSet?.selections, [...parentObj, new_selection.name.value]);
        //     }
        // });

        Object.keys(selection)?.forEach((newSelection:any) => {
            const current = selection[newSelection];
            console.log(current.name.value);
            if(parentObj) {
                // Merge the two objects
                _.merge(filter, [...parentObj, null].reduceRight((obj, next) => {
                    if(next === null) return ({[current.name.value]: 1});
                    return ({[next]: obj});
                }, {}));
            }
            

            if(current?.selectionSet?.selections) {
                if(!parentObj) recurse(current.selectionSet.selections);
                else recurse(current.selectionSet.selections, [...parentObj, current.name.value]);
            }
        });
    }

    // Start the recursive function
    recurse(context.operation.selectionSet.selections);

    // Finally return the filter
    return filter;
}