
export function durationToString(duration){
    let seconds = duration%60;
    let minutes = (Math.floor(duration/60))%60;
    let hours   = Math.floor(duration/3600);

    let string = "";
    if (hours) string+=(`${hours}:`)
    string+=(`${((hours>0)&&(minutes<10))?'0':''}${minutes}:`)
    string+=(`${seconds<10?'0':''}${seconds}`)
    return string;
}

export function viewsToString(viewCount){
    let views = [
        viewCount % 1e3,
        (Math.floor(viewCount/1e3))%1e3,
        (Math.floor(viewCount/1e6))%1e3,
        (Math.floor(viewCount/1e9)),
    ];

    let num = 0;
    let dec = 0;
    let suf = "";

    if(views[3] > 0) {
        num = views[3];
        dec = Math.floor(views[2]/1e2);
        if (num > 10) dec = false;

        suf = " Md de";
    } else if (views[2] > 0){
        num = views[2];
        dec = Math.floor(views[1]/1e2);

        if (num > 10) dec = false;
        suf = " M de";
    } else if (views[1] > 0){
        num = views[1];
        dec = Math.floor(views[0]/1e2);

        if (num > 10) dec = false;
        suf = " k";
    } else {
        num = views[0];
        dec = false;
        suf = "";
    }



    let string = `${num}`;
    if (dec !== false) string+=`,${dec}`;
    string+=`${suf} vues`;
    return string;
}

export function dateToString(timestamp){
    let date = new Date(timestamp);

    const months = [
        "janv.",
        "févr.",
        "mars",
        "avr.",
        "mai",
        "juin",
        "juill.",
        "août",
        "sept.",
        "oct.",
        "nov.",
        "déc."
    ];
    
    let day   = date.getUTCDate();
    let month = date.getUTCMonth();
    let year  = date.getUTCFullYear();

    let string = `${day} ${months[month]} ${year}`;
    return string;
}

