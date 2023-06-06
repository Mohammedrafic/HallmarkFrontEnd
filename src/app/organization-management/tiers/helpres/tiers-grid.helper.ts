export const getCorrectFieldValue = (value: string | null) => value === null ? 'All' : value;

export const workcommitgridValue = (value : any) => value.length > 0 ? value.map((m: { workCommitmentName: any; })=>m.workCommitmentName).join(',' ) : "";

export const skillgridValue = (value : any) =>  value === 3 ? "Secondary" : (value === 2 ? "Primary" : (value === 1 ? "All" : ""));
