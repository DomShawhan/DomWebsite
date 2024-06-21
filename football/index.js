const express = require("express");
const app = module.exports = express();
const ss = require('simple-statistics');

app.set("view engine", "ejs");

const YahooFantasy = require('yahoo-fantasy');
app.yf = new YahooFantasy(
    process.env.YClientID,
    process.env.YClientSecret,
    process.env.YRedirect
);

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

app.get('/league/season/:leagueid1/:leagueid2', async (req, res) => {
    try {
        //Get standings
        const standings1 = await app.yf.league.standings(req.params.leagueid1);
        const standings2 = await app.yf.league.standings(req.params.leagueid2);
        const season1 = [];
        const season2 = [];
        for (let i = 0; i < standings1.standings.length; i++) {
            let team = {
                logo_url: standings1.standings[i].team_logos[0].url,
                team_key: standings1.standings[i].team_key,
                team_id: standings1.standings[i].team_id,
                name: standings1.standings[i].name,
                weeklyScores: [],
                seasonTotal: 0,
                min: 0,
                max: 0,
                avg: 0,
                stddev: 0,
                wins: 0,
                losses: 0,
                ties: 0,
                rank: standings1.standings[i].standings.rank,
                avgMinusTopAndBottom25Percent: 0
            };
            season1.push(team);
        }
        for (let i = 0; i < standings2.standings.length; i++) {
            let team = {
                logo_url: standings2.standings[i].team_logos[0].url,
                team_key: standings2.standings[i].team_key,
                team_id: standings2.standings[i].team_id,
                name: standings2.standings[i].name,
                weeklyScores: [],
                seasonTotal: 0,
                min: 0,
                max: 0,
                avg: 0,
                stddev: 0,
                wins: 0,
                losses: 0,
                ties: 0,
                rank: standings2.standings[i].standings.rank,
                avgMinusTopAndBottom25Percent: 0
            };
            season2.push(team);
        }
        for (let w = 1; w < 18; w++) {
            const weeklyScoreboard1 = await app.yf.league.scoreboard(req.params.leagueid1, w.toString());
            const weeklyScoreboard2 = await app.yf.league.scoreboard(req.params.leagueid2, w.toString());

            weeklyScoreboard1.scoreboard.matchups.forEach(async matchup => {
                matchup.teams.forEach(async team => {
                    season1.forEach(async r => {
                        if (r.team_id === team.team_id) {
                            r.weeklyScores.push(Number(team.points.total));
                            r.seasonTotal += Number(team.points.total);
                            r.min = ss.min(r.weeklyScores);
                            r.max = ss.max(r.weeklyScores);
                            r.avg = ss.average(r.weeklyScores);
                            r.stddev = ss.standardDeviation(r.weeklyScores);
                            r.avgMinusTopAndBottom25Percent = avgMinusTopAndBottom25Percent(r.weeklyScores);
                            if(matchup.is_tied == 1) {
                                r.ties++;
                            } else if(matchup.winner_team_key == team.team_key) {
                                r.wins++;
                            } else {
                                r.losses++;
                            }
                        }
                    });
                });
            });

            weeklyScoreboard2.scoreboard.matchups.forEach(async matchup => {
                matchup.teams.forEach(async team => {
                    season2.forEach(async r => {
                        if (r.team_id === team.team_id) {
                            r.weeklyScores.push(Number(team.points.total));
                            r.seasonTotal += Number(team.points.total);
                            r.min = ss.min(r.weeklyScores);
                            r.max = ss.max(r.weeklyScores);
                            r.avg = ss.average(r.weeklyScores);
                            r.stddev = ss.standardDeviation(r.weeklyScores);
                            r.avgMinusTopAndBottom25Percent = avgMinusTopAndBottom25Percent(r.weeklyScores);
                            if(matchup.is_tied == 1) {
                                r.ties++;
                            } else if(matchup.winner_team_key == team.team_key) {
                                r.wins++;
                            } else {
                                r.losses++;
                            }
                        }
                    });
                });
            });
        }
        let leagueStats1 = [];
        let leagueRecord1 = {
            wins: 0,
            losses: 0,
            ties: 0
        }

        let leagueStats2 = [];
        let leagueRecord2 = {
            wins: 0,
            losses: 0,
            ties: 0
        }

        season1.forEach(rdata => {
            leagueRecord1.wins += rdata.wins;
            leagueRecord1.losses += rdata.losses;
            leagueRecord1.ties += rdata.ties;
            leagueStats1.push(...rdata.weeklyScores);
        });

        season2.forEach(rdata => {
            leagueRecord2.wins += rdata.wins;
            leagueRecord2.losses += rdata.losses;
            leagueRecord2.ties += rdata.ties;
            leagueStats2.push(...rdata.weeklyScores);
        });

        let leagueData1 = {
            logo_url: '',
            team_key: '',
            team_id: '',
            name: 'League',
            weeklyScores: leagueStats1,
            seasonTotal: ss.sum(leagueStats1),
            min: ss.min(leagueStats1),
            max: ss.max(leagueStats1),
            avg: ss.average(leagueStats1),
            stddev: ss.standardDeviation(leagueStats1),
            avgMinusTopAndBottom25Percent: avgMinusTopAndBottom25Percent(leagueStats1),
            wins: leagueRecord1.wins,
            losses: leagueRecord1.losses,
            ties: leagueRecord1.ties,
            rank: 0
        };

        season1.push(leagueData1);

        let leagueData2 = {
            logo_url: '',
            team_key: '',
            team_id: '',
            name: 'League',
            weeklyScores: leagueStats2,
            seasonTotal: ss.sum(leagueStats2),
            min: ss.min(leagueStats2),
            max: ss.max(leagueStats2),
            avg: ss.average(leagueStats2),
            stddev: ss.standardDeviation(leagueStats2),
            avgMinusTopAndBottom25Percent: avgMinusTopAndBottom25Percent(leagueStats2),
            wins: leagueRecord2.wins,
            losses: leagueRecord2.losses,
            ties: leagueRecord2.ties,
            rank: 0
        };

        season2.push(leagueData2);

        let returnData = [];

        season1.forEach(t => {
            let team2 = season2.find(team => team.team_id == t.team_id);

            let data = {
                logo_url: t.logo_url,
                team_key: t.team_key,
                team_id: t.team_id,
                name: t.name + ' / ' + team2.name,
                weeklyScores: [...t.weeklyScores, ...team2.weeklyScores],
                seasonTotal: t.seasonTotal - team2.seasonTotal,
                min: t.min - team2.min,
                max: t.max - team2.max,
                avg: t.avg - team2.avg,
                stddev: t.stddev - team2.stddev,
                avgMinusTopAndBottom25Percent: t.avgMinusTopAndBottom25Percent - team2.avgMinusTopAndBottom25Percent,
                wins: t.wins - team2.wins,
                losses: t.losses - team2.losses,
                ties: t.ties - team2.ties,
                rank: 0
            }

            returnData.push(data);
        })
        
        res.render('fantasyfootball/seasoncompare', {data: returnData});
    } catch (e) {
        console.log(e)
        res.send(e);
    }
})

app.get('/league/season/:leagueid', async (req, res) => {
    try {
        //Get standings
        const standings = await app.yf.league.standings(req.params.leagueid);
        const returnData = [];
        for (let i = 0; i < standings.standings.length; i++) {
            let team = {
                logo_url: standings.standings[i].team_logos[0].url,
                team_key: standings.standings[i].team_key,
                team_id: standings.standings[i].team_id,
                name: standings.standings[i].name,
                weeklyScores: [],
                seasonTotal: 0,
                min: 0,
                max: 0,
                avg: 0,
                stddev: 0,
                wins: 0,
                losses: 0,
                ties: 0,
                rank: standings.standings[i].standings.rank,
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
                            if(matchup.is_tied == 1) {
                                r.ties++;
                            } else if(matchup.winner_team_key == team.team_key) {
                                r.wins++;
                            } else {
                                r.losses++;
                            }
                        }
                    });
                });
            });
        }
        let leagueStats = [];
        let leagueRecord = {
            wins: 0,
            losses: 0,
            ties: 0
        }

        returnData.forEach(rdata => {
            leagueRecord.wins += rdata.wins;
            leagueRecord.losses += rdata.losses;
            leagueRecord.ties += rdata.ties;
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
            avgMinusTopAndBottom25Percent: avgMinusTopAndBottom25Percent(leagueStats),
            wins: leagueRecord.wins,
            losses: leagueRecord.losses,
            ties: leagueRecord.ties,
            rank: 0
        };
        returnData.push(leagueData);

        res.render('fantasyfootball/season', {data: returnData});
    } catch (e) {
        console.log(e)
        res.send(e);
    }
})

app.get('/league/positions/:leagueid1/:leagueid2', async (req, res) => {
    try {
        const standings1 = await app.yf.league.standings(req.params.leagueid1);
        const standings2 = await app.yf.league.standings(req.params.leagueid2);
        const updatedTeams1 = [];
        const updatedTeams2 = [];
        // Populate the teams
        standings1.standings.forEach(async (team) => {
            let newTeam = {
                logo_url: team.team_logos[0].url,
                team_key: team.team_key,
                team_id: team.team_id,
                name: team.name,
                rank: team.standings.rank,
                qbWeekly: [],
                qbTotal: 0,
                rbWeekly: [],
                rbTotal: 0,
                wrWeekly: [],
                wrTotal: 0,
                teWeekly: [],
                teTotal: 0,
                kWeekly: [],
                kTotal: 0,
                dWeekly: [],
                dTotal: 0,
                min: {},
                max: {},
                avg: {},
                stddev: {},
                avgMinusTopAndBottom25Percent: {}
            }

            updatedTeams1.push(newTeam);
        });

        standings2.standings.forEach(async (team) => {
            let newTeam = {
                logo_url: team.team_logos[0].url,
                team_key: team.team_key,
                team_id: team.team_id,
                name: team.name,
                rank: team.standings.rank,
                qbWeekly: [],
                qbTotal: 0,
                rbWeekly: [],
                rbTotal: 0,
                wrWeekly: [],
                wrTotal: 0,
                teWeekly: [],
                teTotal: 0,
                kWeekly: [],
                kTotal: 0,
                dWeekly: [],
                dTotal: 0,
                min: {},
                max: {},
                avg: {},
                stddev: {},
                avgMinusTopAndBottom25Percent: {}
            }

            updatedTeams2.push(newTeam);
        });
        // Get stats for each week from 1 - 17
        for(let w = 1; w < 18; w++) {
            for(let i = 0; i < updatedTeams1.length; i++) {
                let team = updatedTeams1[i];
                const week = await app.yf.roster.players(team.team_key, w.toString(), ['stats']);
                const weekTotals = {
                    qb: 0,
                    rb: 0,
                    wr: 0,
                    te: 0,
                    k: 0,
                    d: 0
                }

                for(let p = 0; p < week.roster.length; p++ ) {
                    let player = week.roster[p];
                    if(player.selected_position != 'BN' && player.selected_position != 'IR') {
                        switch(player.primary_position) {
                            case 'QB': {
                                weekTotals.qb += Number(player.player_points.total);
                                break;
                            }
                            case 'RB': {
                                weekTotals.rb += Number(player.player_points.total);
                                break;
                            }
                            case 'WR': {
                                weekTotals.wr += Number(player.player_points.total);
                                break;
                            }
                            case 'TE': {
                                weekTotals.te += Number(player.player_points.total);
                                break;
                            }
                            case 'K': {
                                weekTotals.k += Number(player.player_points.total);
                                break;
                            }
                            case 'DEF': {
                                weekTotals.d += Number(player.player_points.total);
                                break;
                            }
                        }
                    }
                }

                team.qbWeekly.push(weekTotals.qb);
                team.qbTotal += weekTotals.qb;
                team.rbWeekly.push(weekTotals.rb);
                team.rbTotal += weekTotals.rb;
                team.wrWeekly.push(weekTotals.wr);
                team.wrTotal += weekTotals.wr;
                team.teWeekly.push(weekTotals.te);
                team.teTotal += weekTotals.te;
                team.kWeekly.push(weekTotals.k);
                team.kTotal += weekTotals.k;
                team.dWeekly.push(weekTotals.d);
                team.dTotal += weekTotals.d;
            }

            for(let i = 0; i < updatedTeams2.length; i++) {
                let team = updatedTeams2[i];
                const week = await app.yf.roster.players(team.team_key, w.toString(), ['stats']);
                const weekTotals = {
                    qb: 0,
                    rb: 0,
                    wr: 0,
                    te: 0,
                    k: 0,
                    d: 0
                }

                for(let p = 0; p < week.roster.length; p++ ) {
                    let player = week.roster[p];
                    if(player.selected_position != 'BN' && player.selected_position != 'IR') {
                        switch(player.primary_position) {
                            case 'QB': {
                                weekTotals.qb += Number(player.player_points.total);
                                break;
                            }
                            case 'RB': {
                                weekTotals.rb += Number(player.player_points.total);
                                break;
                            }
                            case 'WR': {
                                weekTotals.wr += Number(player.player_points.total);
                                break;
                            }
                            case 'TE': {
                                weekTotals.te += Number(player.player_points.total);
                                break;
                            }
                            case 'K': {
                                weekTotals.k += Number(player.player_points.total);
                                break;
                            }
                            case 'DEF': {
                                weekTotals.d += Number(player.player_points.total);
                                break;
                            }
                        }
                    }
                }

                team.qbWeekly.push(weekTotals.qb);
                team.qbTotal += weekTotals.qb;
                team.rbWeekly.push(weekTotals.rb);
                team.rbTotal += weekTotals.rb;
                team.wrWeekly.push(weekTotals.wr);
                team.wrTotal += weekTotals.wr;
                team.teWeekly.push(weekTotals.te);
                team.teTotal += weekTotals.te;
                team.kWeekly.push(weekTotals.k);
                team.kTotal += weekTotals.k;
                team.dWeekly.push(weekTotals.d);
                team.dTotal += weekTotals.d;
            }
        }
        // For League stats
        let league1 = {
            logo_url: '',
            team_key:'',
            team_id: '',
            name: 'League',
            rank: '',
            qbWeekly: [],
            qbTotal: 0,
            rbWeekly: [],
            rbTotal: 0,
            wrWeekly: [],
            wrTotal: 0,
            teWeekly: [],
            teTotal: 0,
            kWeekly: [],
            kTotal: 0,
            dWeekly: [],
            dTotal: 0,
            min: {},
            max: {},
            avg: {},
            stddev: {},
            avgMinusTopAndBottom25Percent: {}
        }
        // For League stats
        let league2 = {
            logo_url: '',
            team_key:'',
            team_id: '',
            name: 'League',
            rank: '',
            qbWeekly: [],
            qbTotal: 0,
            rbWeekly: [],
            rbTotal: 0,
            wrWeekly: [],
            wrTotal: 0,
            teWeekly: [],
            teTotal: 0,
            kWeekly: [],
            kTotal: 0,
            dWeekly: [],
            dTotal: 0,
            min: {},
            max: {},
            avg: {},
            stddev: {},
            avgMinusTopAndBottom25Percent: {}
        }
        for(let i = 0; i < updatedTeams1.length; i++) {
            league1.qbWeekly.push(...updatedTeams1[i].qbWeekly);
            league1.rbWeekly.push(...updatedTeams1[i].rbWeekly);
            league1.wrWeekly.push(...updatedTeams1[i].wrWeekly);
            league1.teWeekly.push(...updatedTeams1[i].teWeekly);
            league1.kWeekly.push(...updatedTeams1[i].kWeekly);
            league1.dWeekly.push(...updatedTeams1[i].dWeekly);

            league1.qbTotal += updatedTeams1[i].qbTotal;
            league1.rbTotal += updatedTeams1[i].rbTotal;
            league1.wrTotal += updatedTeams1[i].wrTotal;
            league1.teTotal += updatedTeams1[i].teTotal;
            league1.kTotal += updatedTeams1[i].kTotal;
            league1.dTotal += updatedTeams1[i].dTotal;

            league2.qbWeekly.push(...updatedTeams2[i].qbWeekly);
            league2.rbWeekly.push(...updatedTeams2[i].rbWeekly);
            league2.wrWeekly.push(...updatedTeams2[i].wrWeekly);
            league2.teWeekly.push(...updatedTeams2[i].teWeekly);
            league2.kWeekly.push(...updatedTeams2[i].kWeekly);
            league2.dWeekly.push(...updatedTeams2[i].dWeekly);

            league2.qbTotal += updatedTeams2[i].qbTotal;
            league2.rbTotal += updatedTeams2[i].rbTotal;
            league2.wrTotal += updatedTeams2[i].wrTotal;
            league2.teTotal += updatedTeams2[i].teTotal;
            league2.kTotal += updatedTeams2[i].kTotal;
            league2.dTotal += updatedTeams2[i].dTotal;
            //Calculate positional stats - League 1
            updatedTeams1[i].min = {
                qb: ss.min(updatedTeams1[i].qbWeekly),
                rb: ss.min(updatedTeams1[i].rbWeekly),
                wr: ss.min(updatedTeams1[i].wrWeekly),
                te: ss.min(updatedTeams1[i].teWeekly),
                k: ss.min(updatedTeams1[i].kWeekly),
                d: ss.min(updatedTeams1[i].dWeekly),
            };

            updatedTeams1[i].max = {
                qb: ss.max(updatedTeams1[i].qbWeekly),
                rb: ss.max(updatedTeams1[i].rbWeekly),
                wr: ss.max(updatedTeams1[i].wrWeekly),
                te: ss.max(updatedTeams1[i].teWeekly),
                k: ss.max(updatedTeams1[i].kWeekly),
                d: ss.max(updatedTeams1[i].dWeekly),
            };

            updatedTeams1[i].avg = {
                qb: ss.average(updatedTeams1[i].qbWeekly),
                rb: ss.average(updatedTeams1[i].rbWeekly),
                wr: ss.average(updatedTeams1[i].wrWeekly),
                te: ss.average(updatedTeams1[i].teWeekly),
                k: ss.average(updatedTeams1[i].kWeekly),
                d: ss.average(updatedTeams1[i].dWeekly),
            };

            updatedTeams1[i].stddev = {
                qb: ss.standardDeviation(updatedTeams1[i].qbWeekly),
                rb: ss.standardDeviation(updatedTeams1[i].rbWeekly),
                wr: ss.standardDeviation(updatedTeams1[i].wrWeekly),
                te: ss.standardDeviation(updatedTeams1[i].teWeekly),
                k: ss.standardDeviation(updatedTeams1[i].kWeekly),
                d: ss.standardDeviation(updatedTeams1[i].dWeekly),
            };

            updatedTeams1[i].avgMinusTopAndBottom25Percent = {
                qb: avgMinusTopAndBottom25Percent(updatedTeams1[i].qbWeekly),
                rb: avgMinusTopAndBottom25Percent(updatedTeams1[i].rbWeekly),
                wr: avgMinusTopAndBottom25Percent(updatedTeams1[i].wrWeekly),
                te: avgMinusTopAndBottom25Percent(updatedTeams1[i].teWeekly),
                k: avgMinusTopAndBottom25Percent(updatedTeams1[i].kWeekly),
                d: avgMinusTopAndBottom25Percent(updatedTeams1[i].dWeekly),
            };
            //Calculate positional stats - League 2
            updatedTeams2[i].min = {
                qb: ss.min(updatedTeams2[i].qbWeekly),
                rb: ss.min(updatedTeams2[i].rbWeekly),
                wr: ss.min(updatedTeams2[i].wrWeekly),
                te: ss.min(updatedTeams2[i].teWeekly),
                k: ss.min(updatedTeams2[i].kWeekly),
                d: ss.min(updatedTeams2[i].dWeekly),
            };

            updatedTeams2[i].max = {
                qb: ss.max(updatedTeams2[i].qbWeekly),
                rb: ss.max(updatedTeams2[i].rbWeekly),
                wr: ss.max(updatedTeams2[i].wrWeekly),
                te: ss.max(updatedTeams2[i].teWeekly),
                k: ss.max(updatedTeams2[i].kWeekly),
                d: ss.max(updatedTeams2[i].dWeekly),
            };

            updatedTeams2[i].avg = {
                qb: ss.average(updatedTeams2[i].qbWeekly),
                rb: ss.average(updatedTeams2[i].rbWeekly),
                wr: ss.average(updatedTeams2[i].wrWeekly),
                te: ss.average(updatedTeams2[i].teWeekly),
                k: ss.average(updatedTeams2[i].kWeekly),
                d: ss.average(updatedTeams2[i].dWeekly),
            };

            updatedTeams2[i].stddev = {
                qb: ss.standardDeviation(updatedTeams2[i].qbWeekly),
                rb: ss.standardDeviation(updatedTeams2[i].rbWeekly),
                wr: ss.standardDeviation(updatedTeams2[i].wrWeekly),
                te: ss.standardDeviation(updatedTeams2[i].teWeekly),
                k: ss.standardDeviation(updatedTeams2[i].kWeekly),
                d: ss.standardDeviation(updatedTeams2[i].dWeekly),
            };

            updatedTeams2[i].avgMinusTopAndBottom25Percent = {
                qb: avgMinusTopAndBottom25Percent(updatedTeams2[i].qbWeekly),
                rb: avgMinusTopAndBottom25Percent(updatedTeams2[i].rbWeekly),
                wr: avgMinusTopAndBottom25Percent(updatedTeams2[i].wrWeekly),
                te: avgMinusTopAndBottom25Percent(updatedTeams2[i].teWeekly),
                k: avgMinusTopAndBottom25Percent(updatedTeams2[i].kWeekly),
                d: avgMinusTopAndBottom25Percent(updatedTeams2[i].dWeekly),
            };
        }
        //Calculate stats for the league total - League 1
        league1.min = {
            qb: ss.min(league1.qbWeekly),
            rb: ss.min(league1.rbWeekly),
            wr: ss.min(league1.wrWeekly),
            te: ss.min(league1.teWeekly),
            k: ss.min(league1.kWeekly),
            d: ss.min(league1.dWeekly),
        };

        league1.max = {
            qb: ss.max(league1.qbWeekly),
            rb: ss.max(league1.rbWeekly),
            wr: ss.max(league1.wrWeekly),
            te: ss.max(league1.teWeekly),
            k: ss.max(league1.kWeekly),
            d: ss.max(league1.dWeekly),
        };

        league1.avg = {
            qb: ss.average(league1.qbWeekly),
            rb: ss.average(league1.rbWeekly),
            wr: ss.average(league1.wrWeekly),
            te: ss.average(league1.teWeekly),
            k: ss.average(league1.kWeekly),
            d: ss.average(league1.dWeekly),
        };

        league1.stddev = {
            qb: ss.standardDeviation(league1.qbWeekly),
            rb: ss.standardDeviation(league1.rbWeekly),
            wr: ss.standardDeviation(league1.wrWeekly),
            te: ss.standardDeviation(league1.teWeekly),
            k: ss.standardDeviation(league1.kWeekly),
            d: ss.standardDeviation(league1.dWeekly),
        };

        league1.avgMinusTopAndBottom25Percent = {
            qb: avgMinusTopAndBottom25Percent(league1.qbWeekly),
            rb: avgMinusTopAndBottom25Percent(league1.rbWeekly),
            wr: avgMinusTopAndBottom25Percent(league1.wrWeekly),
            te: avgMinusTopAndBottom25Percent(league1.teWeekly),
            k: avgMinusTopAndBottom25Percent(league1.kWeekly),
            d: avgMinusTopAndBottom25Percent(league1.dWeekly),
        };

        //Calculate stats for the league total - League 2
        league2.min = {
            qb: ss.min(league2.qbWeekly),
            rb: ss.min(league2.rbWeekly),
            wr: ss.min(league2.wrWeekly),
            te: ss.min(league2.teWeekly),
            k: ss.min(league2.kWeekly),
            d: ss.min(league2.dWeekly),
        };

        league2.max = {
            qb: ss.max(league2.qbWeekly),
            rb: ss.max(league2.rbWeekly),
            wr: ss.max(league2.wrWeekly),
            te: ss.max(league2.teWeekly),
            k: ss.max(league2.kWeekly),
            d: ss.max(league2.dWeekly),
        };

        league2.avg = {
            qb: ss.average(league2.qbWeekly),
            rb: ss.average(league2.rbWeekly),
            wr: ss.average(league2.wrWeekly),
            te: ss.average(league2.teWeekly),
            k: ss.average(league2.kWeekly),
            d: ss.average(league2.dWeekly),
        };

        league2.stddev = {
            qb: ss.standardDeviation(league2.qbWeekly),
            rb: ss.standardDeviation(league2.rbWeekly),
            wr: ss.standardDeviation(league2.wrWeekly),
            te: ss.standardDeviation(league2.teWeekly),
            k: ss.standardDeviation(league2.kWeekly),
            d: ss.standardDeviation(league2.dWeekly),
        };

        league2.avgMinusTopAndBottom25Percent = {
            qb: avgMinusTopAndBottom25Percent(league2.qbWeekly),
            rb: avgMinusTopAndBottom25Percent(league2.rbWeekly),
            wr: avgMinusTopAndBottom25Percent(league2.wrWeekly),
            te: avgMinusTopAndBottom25Percent(league2.teWeekly),
            k: avgMinusTopAndBottom25Percent(league2.kWeekly),
            d: avgMinusTopAndBottom25Percent(league2.dWeekly),
        };

        updatedTeams1.push(league1);
        updatedTeams2.push(league2);

        let returnData = [];

        for(let i = 0; i < updatedTeams1.length; i++) {
            let team = updatedTeams1[i];
            let team2 = updatedTeams2.find(t => t.team_id == team.team_id);
            let updTeam = {
                logo_url: team.logo_url,
                team_key: team.team_key,
                team_id: team.team_id,
                name:  team.name + ' / ' + team2.name,
                rank: 0,
                qbTotal: team.qbTotal - team2.qbTotal,
                rbTotal: team.rbTotal - team2.rbTotal,
                wrTotal: team.wrTotal - team2.wrTotal,
                teTotal: team.teTotal - team2.teTotal,
                kTotal: team.kTotal - team2.kTotal,
                dTotal: team.dTotal - team2.dTotal,
                min: {
                    qb: team.min.qb - team2.min.qb,
                    rb: team.min.rb - team2.min.rb,
                    wr: team.min.wr - team2.min.wr,
                    te: team.min.te - team2.min.te,
                    k: team.min.k - team2.min.k,
                    d: team.min.d - team2.min.d
                },
                max: {
                    qb: team.max.qb - team2.max.qb,
                    rb: team.max.rb - team2.max.rb,
                    wr: team.max.wr - team2.max.wr,
                    te: team.max.te - team2.max.te,
                    k: team.max.k - team2.max.k,
                    d: team.max.d - team2.max.d
                },
                avg: {
                    qb: team.avg.qb - team2.avg.qb,
                    rb: team.avg.rb - team2.avg.rb,
                    wr: team.avg.wr - team2.avg.wr,
                    te: team.avg.te - team2.avg.te,
                    k: team.avg.k - team2.avg.k,
                    d: team.avg.d - team2.avg.d
                },
                stddev: {
                    qb: team.stddev.qb - team2.stddev.qb,
                    rb: team.stddev.rb - team2.stddev.rb,
                    wr: team.stddev.wr - team2.stddev.wr,
                    te: team.stddev.te - team2.stddev.te,
                    k: team.stddev.k - team2.stddev.k,
                    d: team.stddev.d - team2.stddev.d
                },
                avgMinusTopAndBottom25Percent: {
                    qb: team.avgMinusTopAndBottom25Percent.qb - team2.avgMinusTopAndBottom25Percent.qb,
                    rb: team.avgMinusTopAndBottom25Percent.rb - team2.avgMinusTopAndBottom25Percent.rb,
                    wr: team.avgMinusTopAndBottom25Percent.wr - team2.avgMinusTopAndBottom25Percent.wr,
                    te: team.avgMinusTopAndBottom25Percent.te - team2.avgMinusTopAndBottom25Percent.te,
                    k: team.avgMinusTopAndBottom25Percent.k - team2.avgMinusTopAndBottom25Percent.k,
                    d: team.avgMinusTopAndBottom25Percent.d - team2.avgMinusTopAndBottom25Percent.d
                }
            }

            returnData.push(updTeam);
        }

        res.render('fantasyfootball/positionscompare', { teams: returnData });
    } catch (e) {
        console.log(e)
        res.redirect('/');
    }
})

app.get('/league/positions/:leagueid', async (req, res) => {
    try {
        const standings = await app.yf.league.standings(req.params.leagueid);
        const updatedTeams = [];
        // Populate the teams
        standings.standings.forEach(async (team, index) => {
            let newTeam = {
                logo_url: team.team_logos[0].url,
                team_key: team.team_key,
                team_id: team.team_id,
                name: team.name,
                rank: team.standings.rank,
                qbWeekly: [],
                qbTotal: 0,
                rbWeekly: [],
                rbTotal: 0,
                wrWeekly: [],
                wrTotal: 0,
                teWeekly: [],
                teTotal: 0,
                kWeekly: [],
                kTotal: 0,
                dWeekly: [],
                dTotal: 0,
                min: {},
                max: {},
                avg: {},
                stddev: {},
                avgMinusTopAndBottom25Percent: {}
            }

            updatedTeams.push(newTeam);
        });
        // Get stats for each week from 1 - 17
        for(let w = 1; w < 18; w++) {
            for(let i = 0; i < updatedTeams.length; i++) {
                let team = updatedTeams[i];
                const week = await app.yf.roster.players(team.team_key, w.toString(), ['stats']);
                const weekTotals = {
                    qb: 0,
                    rb: 0,
                    wr: 0,
                    te: 0,
                    k: 0,
                    d: 0
                }

                for(let p = 0; p < week.roster.length; p++ ) {
                    let player = week.roster[p];
                    if(player.selected_position != 'BN' && player.selected_position != 'IR') {
                        switch(player.primary_position) {
                            case 'QB': {
                                weekTotals.qb += Number(player.player_points.total);
                                break;
                            }
                            case 'RB': {
                                weekTotals.rb += Number(player.player_points.total);
                                break;
                            }
                            case 'WR': {
                                weekTotals.wr += Number(player.player_points.total);
                                break;
                            }
                            case 'TE': {
                                weekTotals.te += Number(player.player_points.total);
                                break;
                            }
                            case 'K': {
                                weekTotals.k += Number(player.player_points.total);
                                break;
                            }
                            case 'DEF': {
                                weekTotals.d += Number(player.player_points.total);
                                break;
                            }
                        }
                    }
                }

                team.qbWeekly.push(weekTotals.qb);
                team.qbTotal += weekTotals.qb;
                team.rbWeekly.push(weekTotals.rb);
                team.rbTotal += weekTotals.rb;
                team.wrWeekly.push(weekTotals.wr);
                team.wrTotal += weekTotals.wr;
                team.teWeekly.push(weekTotals.te);
                team.teTotal += weekTotals.te;
                team.kWeekly.push(weekTotals.k);
                team.kTotal += weekTotals.k;
                team.dWeekly.push(weekTotals.d);
                team.dTotal += weekTotals.d;
            }
        }
        // For League stats
        let league = {
            logo_url: '',
            team_key:'',
            team_id: '',
            name: 'League',
            rank: '',
            qbWeekly: [],
            qbTotal: 0,
            rbWeekly: [],
            rbTotal: 0,
            wrWeekly: [],
            wrTotal: 0,
            teWeekly: [],
            teTotal: 0,
            kWeekly: [],
            kTotal: 0,
            dWeekly: [],
            dTotal: 0,
            min: {},
            max: {},
            avg: {},
            stddev: {},
            avgMinusTopAndBottom25Percent: {}
        }
        for(let i = 0; i < updatedTeams.length; i++) {
            league.qbWeekly.push(...updatedTeams[i].qbWeekly);
            league.rbWeekly.push(...updatedTeams[i].rbWeekly);
            league.wrWeekly.push(...updatedTeams[i].wrWeekly);
            league.teWeekly.push(...updatedTeams[i].teWeekly);
            league.kWeekly.push(...updatedTeams[i].kWeekly);
            league.dWeekly.push(...updatedTeams[i].dWeekly);

            league.qbTotal += updatedTeams[i].qbTotal;
            league.rbTotal += updatedTeams[i].rbTotal;
            league.wrTotal += updatedTeams[i].wrTotal;
            league.teTotal += updatedTeams[i].teTotal;
            league.kTotal += updatedTeams[i].kTotal;
            league.dTotal += updatedTeams[i].dTotal;
            //Calculate positional stats
            updatedTeams[i].min = {
                qb: ss.min(updatedTeams[i].qbWeekly),
                rb: ss.min(updatedTeams[i].rbWeekly),
                wr: ss.min(updatedTeams[i].wrWeekly),
                te: ss.min(updatedTeams[i].teWeekly),
                k: ss.min(updatedTeams[i].kWeekly),
                d: ss.min(updatedTeams[i].dWeekly),
            };

            updatedTeams[i].max = {
                qb: ss.max(updatedTeams[i].qbWeekly),
                rb: ss.max(updatedTeams[i].rbWeekly),
                wr: ss.max(updatedTeams[i].wrWeekly),
                te: ss.max(updatedTeams[i].teWeekly),
                k: ss.max(updatedTeams[i].kWeekly),
                d: ss.max(updatedTeams[i].dWeekly),
            };

            updatedTeams[i].avg = {
                qb: ss.average(updatedTeams[i].qbWeekly),
                rb: ss.average(updatedTeams[i].rbWeekly),
                wr: ss.average(updatedTeams[i].wrWeekly),
                te: ss.average(updatedTeams[i].teWeekly),
                k: ss.average(updatedTeams[i].kWeekly),
                d: ss.average(updatedTeams[i].dWeekly),
            };

            updatedTeams[i].stddev = {
                qb: ss.standardDeviation(updatedTeams[i].qbWeekly),
                rb: ss.standardDeviation(updatedTeams[i].rbWeekly),
                wr: ss.standardDeviation(updatedTeams[i].wrWeekly),
                te: ss.standardDeviation(updatedTeams[i].teWeekly),
                k: ss.standardDeviation(updatedTeams[i].kWeekly),
                d: ss.standardDeviation(updatedTeams[i].dWeekly),
            };

            updatedTeams[i].avgMinusTopAndBottom25Percent = {
                qb: avgMinusTopAndBottom25Percent(updatedTeams[i].qbWeekly),
                rb: avgMinusTopAndBottom25Percent(updatedTeams[i].rbWeekly),
                wr: avgMinusTopAndBottom25Percent(updatedTeams[i].wrWeekly),
                te: avgMinusTopAndBottom25Percent(updatedTeams[i].teWeekly),
                k: avgMinusTopAndBottom25Percent(updatedTeams[i].kWeekly),
                d: avgMinusTopAndBottom25Percent(updatedTeams[i].dWeekly),
            };
        }
        //Calculate stats for the league total
        league.min = {
            qb: ss.min(league.qbWeekly),
            rb: ss.min(league.rbWeekly),
            wr: ss.min(league.wrWeekly),
            te: ss.min(league.teWeekly),
            k: ss.min(league.kWeekly),
            d: ss.min(league.dWeekly),
        };

        league.max = {
            qb: ss.max(league.qbWeekly),
            rb: ss.max(league.rbWeekly),
            wr: ss.max(league.wrWeekly),
            te: ss.max(league.teWeekly),
            k: ss.max(league.kWeekly),
            d: ss.max(league.dWeekly),
        };

        league.avg = {
            qb: ss.average(league.qbWeekly),
            rb: ss.average(league.rbWeekly),
            wr: ss.average(league.wrWeekly),
            te: ss.average(league.teWeekly),
            k: ss.average(league.kWeekly),
            d: ss.average(league.dWeekly),
        };

        league.stddev = {
            qb: ss.standardDeviation(league.qbWeekly),
            rb: ss.standardDeviation(league.rbWeekly),
            wr: ss.standardDeviation(league.wrWeekly),
            te: ss.standardDeviation(league.teWeekly),
            k: ss.standardDeviation(league.kWeekly),
            d: ss.standardDeviation(league.dWeekly),
        };

        league.avgMinusTopAndBottom25Percent = {
            qb: avgMinusTopAndBottom25Percent(league.qbWeekly),
            rb: avgMinusTopAndBottom25Percent(league.rbWeekly),
            wr: avgMinusTopAndBottom25Percent(league.wrWeekly),
            te: avgMinusTopAndBottom25Percent(league.teWeekly),
            k: avgMinusTopAndBottom25Percent(league.kWeekly),
            d: avgMinusTopAndBottom25Percent(league.dWeekly),
        };

        updatedTeams.push(league);

        res.render('fantasyfootball/positions', { teams: updatedTeams });
    } catch (e) {
        console.log(e)
        res.redirect('/');
    }
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
