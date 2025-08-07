import { Column, Entity, PrimaryColumn } from "typeorm";


@Entity('badges')
export class Badge {

    @PrimaryColumn()
    id: number;

    @Column('varchar')
    name: string;

    @Column('varchar')
    description: string;

    @Column('int')
    condition: number;
}