import * as LANG from '../Language.mjs';

/** @param {number} duration */
export function durationToString(duration){
    let seconds = Math.floor(duration%60);
    let minutes = (Math.floor(duration/60))%60;
    let hours   = Math.floor(duration/3600);

    let string = "";
    if (hours) string+=(`${hours}:`)
    string+=(`${((hours>0)&&(minutes<10))?'0':''}${minutes}:`)
    string+=(`${seconds<10?'0':''}${seconds}`)
    return string;
}

/** @param {number} viewCount */
export function viewsToString(viewCount){
    let string;
    if (viewCount){
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
            suf = LANG.MUSICDISPLAYER_VIEWS_BILLION;
        } else if (views[2] > 0) {
            num = views[2];
            dec = Math.floor(views[1]/1e2);

            if (num > 10) dec = false;
            suf = LANG.MUSICDISPLAYER_VIEWS_MILLION;
        } else if (views[1] > 0) {
            num = views[1];
            dec = Math.floor(views[0]/1e2);

            if (num > 10) dec = false;
            suf = LANG.MUSICDISPLAYER_VIEWS_THOUSAND;
        } else {
            num = views[0];
            dec = false;
            suf = LANG.MUSICDISPLAYER_VIEWS_UNIT;
        }

        string = `${num}`;
        if (dec !== false) string+=`,${dec}`;
        string+=`${suf}`;
    } else string = LANG.MUSICDISPLAYER_VIEWS_UNKNOWN;

    return string;
}

/** @param {string} yyyymmdd */
export function YYYYMMDDToString(yyyymmdd){

    let [year, month, day] = yyyymmdd.match(/(\d{4})(\d{2})(\d{2})/).slice(1,4);

    return LANG.DATE_TEXT_FORMAT(year.replace(/^0+/, ''), (month.replace(/^0+/, ''))-1, day.replace(/^0+/, ''));
}

/** @param {string} text */
export function isItAnURL(text) {
    return (
        (typeof text === "string") &&
        (text.match(/^https?:\/\/(?:[a-zA-Z0-9\-]{1,64}\.){0,}(?:[a-zA-Z0-9\-]{2,63})(?:\.(?:xn--)?[a-zA-Z0-9]{2,})(\:[0-9]{1,5})?(?:\/[^\s]*)?$/) !== null)
    )
    ;
}
