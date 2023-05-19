import {Filter, UpdateFilter, UpdateOptions} from "mongodb";
import {Database} from "./Database";
import {Saveable} from "./Saveable";

export class Student implements Saveable {
    public id: string;
    public username: string;
    public email: string;
    public verified: boolean;

    public constructor(id: string, name: string, email: string, verified: boolean) {
        this.id = id;
        this.username = name;
        this.email = email;
        this.verified = verified;
    }

    public static fromObject(object): Student {
        if (!object) return null;
        const { id, username, email, verified } = object;
        return new Student(id, username, email, verified);
    }

    public async save() {
        const query: Filter<any> = {id: this.id};
        const update: UpdateFilter<any> = {$set: this};
        const options: UpdateOptions = {upsert: true};
        await Database.students.updateOne(query, update, options);
        return this;
    }

    public static async fetch(id: string): Promise<Student> {
        const query = {id: id};
        const document = await Database.students.findOne(query);
        if (!document) return null;
        return Student.fromObject(document);
    }

    public async delete() {
        const query: Filter<any> = {id: this.id};
        await Database.students.deleteOne(query);
    }
}