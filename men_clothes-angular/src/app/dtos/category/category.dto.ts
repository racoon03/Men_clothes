export class CategoryDTO {
    id: number;    
    name: string;    
    editMode: boolean;
    
    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;  
        this.editMode = false;
    }
}