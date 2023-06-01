export const getCorrectFieldValue = (value: string | null) => value === null ? 'All' : value;

export const workcommitgridValue = (value : any) => value.length > 0 ? value.map((m: { name: any; })=>m.name).join(',' ) : "";

export const skillgridValue = (value : any) => {
    console.log(value);
    if(value == 0){
        value = "All";
    } else if(value == 2){
        value = "Primary";
    } else if(value == 3){
        value = "Secondary";
    }
};
