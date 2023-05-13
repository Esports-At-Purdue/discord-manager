export interface Saveable {
    save(): Promise<this>;
}