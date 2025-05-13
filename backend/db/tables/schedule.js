// schedule table schema

/*
    schedule_id: string(UUID), primary key
    user_id: string(UUID), foreign key -> user.user_id

    schedule_name: string, user defined name for the schedule

    arrival_lat: float, latitude of the arrival location
    arrival_lon: float, longitude of the arrival location
    arrival_time: time, when the user wants to arrive at the location

    repeatability: string, nullable (TODO, to be defined later)
*/

module.exports = (table) => {
    table.string('schedule_id').primary(); // PK
    table.string('user_id').notNullable(); // FK → user.user_id
    table.string('schedule_name').notNullable();
    table.float('arrival_lat').notNullable();
    table.float('arrival_lon').notNullable();
    table.time('arrival_time').notNullable();
    table.string('repeatability').nullable();

    table.foreign('user_id').references('user.user_id');
};
