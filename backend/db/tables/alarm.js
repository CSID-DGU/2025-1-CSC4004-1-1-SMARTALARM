// alarm table schema

/*
    alarm_id:    string(UUID), primary key
    user_id:     string(UUID), foreign key -> user.user_id
    schedule_id: string(UUID), foreign key -> schedule.schedule_id

    status:      string, nullable (active, inactive, snoozed)
    time:        time,   when the alarm should ring
*/

module.exports = (table) => {
    table.string('alarm_id').primary(); // PK
    table.string('user_id').notNullable(); // FK -> user.user_id
    table.string('schedule_id').notNullable(); // FK -> schedule.schedule_id
    table.string('status').nullable();
    table.time('time').notNullable();

    table.foreign('user_id').references('user.user_id'); // FK -> user.user_id
};
