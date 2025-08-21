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

    @Column({type: 'varchar', nullable: true})
    badge_image_location: string;

    @Column({type: 'varchar', nullable: true})
    bordered_badge_image_location: string;

    @Column({type: 'varchar', nullable: true})
    gif: string;
}