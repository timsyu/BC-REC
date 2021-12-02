const schedule = require('node-schedule');

main = async() => {
    let rule = new schedule.RecurrenceRule();
    rule.second = [0, 10, 20 ,30, 40, 50]; // when sec is at 0, 30,...
    let job = schedule.scheduleJob(rule, () => {
        console.log(new Date(),"autoreqdevice");
        let i = 0;
        while (true) {
            i++;
            console.log(i);
            if (i == 118465) {
                break;
            }
        }
    });
}

main = async() => {
    
}

main();