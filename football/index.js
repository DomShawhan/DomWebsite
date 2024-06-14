const express = require("express");
const app = module.exports = express();
const ss = require('simple-statistics');

app.set("view engine", "ejs");

const YahooFantasy = require('yahoo-fantasy');
app.yf = new YahooFantasy(
    process.env.YClientID,
    process.env.YClientSecret,
    app.tokenCallback,
    process.env.YRedirect
);
app.tokenCallback = function ({ access_token, refresh_token }) {
    return new Promise((resolve, reject) => {
        app.accesstoken = access_token;
        return resolve();
    });
};

async function leagueSettings(leagueid) {
    try {
        const data = await app.yf.league.settings(leagueid);
        const scoring = [];
        for (let i = 0; i < data.settings.stat_categories.length; i++) {
            const scoringSetting = {
                category: data.settings.stat_categories[i],
                stat: data.settings.stat_modifiers.stats.find(s => s.stat.stat_id == data.settings.stat_categories[i].stat_id),
            }
            scoring.push(scoringSetting);
        }
        return scoring;
    } catch (e) {
        throw e;
    }
}

app.get('/league/settings/:leagueid', async (req, res) => {
    try {
        const settings = await leagueSettings(req.params.leagueid);
        const data = await app.yf.league.settings(req.params.leagueid);
        res.render('fantasyfootball/settings', {data: data, settings: settings});
    } catch (e) {
        res.send(e);
    }
})

app.get('/league/season/:leagueid', async (req, res) => {
    try {
        //Get settings
        const settings = await leagueSettings(req.params.leagueid);
        // Get list of teams
        const data = await app.yf.league.teams(req.params.leagueid);
        const returnData = [];
        for (let i = 0; i < data.teams.length; i++) {
            let team = {
                logo_url: data.teams[i].team_logos[0].url,
                team_key: data.teams[i].team_key,
                team_id: data.teams[i].team_id,
                name: data.teams[i].name,
                weeklyScores: [],
                seasonTotal: 0,
                min: 0,
                max: 0,
                avg: 0,
                stddev: 0,
                avgMinusTopAndBottom25Percent: 0
            };
            returnData.push(team);
        }
        for (let w = 1; w < 18; w++) {
            const weeklyScoreboard = await app.yf.league.scoreboard(req.params.leagueid, w.toString());

            weeklyScoreboard.scoreboard.matchups.forEach(async matchup => {
                matchup.teams.forEach(async team => {
                    returnData.forEach(async r => {
                        if (r.team_id === team.team_id) {
                            r.weeklyScores.push(Number(team.points.total));
                            r.seasonTotal += Number(team.points.total);
                            r.min = ss.min(r.weeklyScores);
                            r.max = ss.max(r.weeklyScores);
                            r.avg = ss.average(r.weeklyScores);
                            r.stddev = ss.standardDeviation(r.weeklyScores);
                            r.avgMinusTopAndBottom25Percent = avgMinusTopAndBottom25Percent(r.weeklyScores);
                        }
                    });
                });
            });
        }
        let leagueStats = [];

        returnData.forEach(rdata => {
            leagueStats.push(...rdata.weeklyScores);
        });

        let leagueData = {
            logo_url: '',
            team_key: '',
            team_id: '',
            name: 'League',
            weeklyScores: leagueStats,
            seasonTotal: ss.sum(leagueStats),
            min: ss.min(leagueStats),
            max: ss.max(leagueStats),
            avg: ss.average(leagueStats),
            stddev: ss.standardDeviation(leagueStats),
            avgMinusTopAndBottom25Percent: avgMinusTopAndBottom25Percent(leagueStats)
        };
        returnData.push(leagueData);

        res.render('fantasyfootball/season', {data: returnData});
    } catch (e) {
        console.log(e)
        res.send(e);
    }
})

app.get('/auth/yahoo', (req, res) => {
    app.yf.auth(res);
})

app.get('/auth/yahoo/callback', (req, res) => {
    app.yf.authCallback(req, (err) => {
        if (err) {
            return res.redirect("/error");
        }

        return res.redirect("/league");
    })
})

function avgMinusTopAndBottom25Percent(array) {
    if(Array.isArray(array)) {
        const length = array.length;
        const top25Percent = Math.ceil(length * .75)-1 > 0 ? Math.ceil(length * .75)-1: 0;
        const bottom25Percent = Math.floor(length * .25)-1 > 0 ? Math.floor(length * .25)-1 : 0;

        if(top25Percent == bottom25Percent) {
            return array[top25Percent];
        }

        array.sort((a,b) => a - b);
        const updatedArray = array.slice(bottom25Percent, top25Percent);
        
        return ss.average(updatedArray);
    }
}
