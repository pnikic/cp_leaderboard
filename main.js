const fetch = require('node-fetch');
const fs = require('fs');
const log_file = '/home1/studenti/pnikic/public_html/ldr/LOG.txt'

// Contestants
var user_name = ['Mislav Blažević', 'Matej Kroflin', 'Patrick Nikić', 'Antonio Jovanović',
                 'Marko Tutavac', 'Tomislav Prusina', 'Filip Vargić', 'Karlo Iletić',
                 'Filip Kadak', 'Petar Kelava']

var user_cf = ['mblazev', 'Tantor', 'pnikic', 'ajovanov',
               'markotee', 'Tomx', '', 'heon',
               'Kadak', 'pkelava']

var user_uva = ['831136', '851541', '862206', '862009',
                '889120', '937725', '937726', '991117',
                '991123', '1039415'];

var user_icpc = ['219442', '219432', '219871', '250657',
                 '250652', '', '', '',
                 '', ''];

// Storage for contestants' data
var icpc_ac = Array.from(user_name, x => 0)
var icpc_ac_newest = Array.from(user_name, x => 0)
var uva_ac = Array.from(user_name, x => 0)
var uva_ac_newest = Array.from(user_name, x => 0)
var cf_ac = Array.from(user_name, x => new Set())
var cf_ac_newest = Array.from(user_name, x => new Set())
var rating = Array.from(user_name, x => undefined)
var cf_user_data = Array.from(user_name, x => 0)
var ratings_data;

// Flags indicating data fetching success
var done = Array.from(user_cf, x => 0)
var done_rat = 0;
var success = false;

function waitPromise(ms) {
    // Source: https://stackoverflow.com/questions/24928846/get-return-value-from-settimeout
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve('Done')
        }, ms)
    });
}

function timeout(ms, promise) {
    // Source: https://stackoverflow.com/questions/46946380/fetch-api-request-timeout
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            reject("Promise timed out (" +  String(ms) + "ms)")
        }, ms)
        promise.then(resolve, reject)
    })
}

function fetchRatings(retries = 25) {
    if (!retries) {
        return Promise.reject("Promise retries depleted");
    }

    return timeout(2000, fetch('https://codeforces.com/api/user.info?handles=' + user_cf.join(';')))
        .then(res => {
            return res.json();
        })
        .then(data => {
            if (data['status'] == "FAILED") {
                return waitPromise(500).then(function(res) {
                    return fetchRatings(retries - 1);
                });
            }
            else {
                ratings_data = data;
                done_rat = 1;
            }
        })
        .catch(err => {  
            return waitPromise(500).then(function(res) {
                return fetchRatings(retries - 1);
            });
        })
}

function fetch_user(mode, i, retries = 25) {
    // Tries to fullfill the Promise returned by fetch(...) a number of times
    if (!retries) {
        return Promise.reject("Promise retries depleted");
    }

    var url = ((md) => {
        switch(md) {
        case 'cf' : return 'https://codeforces.com/api/user.status?handle=' + user_cf[i];
        case 'uva' : return 'https://uhunt.onlinejudge.org/api/ranklist/' + user_uva[i]  + '/0/0';
        case 'icpc' : return 'https://icpcarchive.ecs.baylor.edu/uhunt/api/ranklist/' + user_icpc[i] + '/0/0';
        }
    })(mode);
    
    return timeout(2000, fetch(url))
        .then(res => {
            return res.json();
        })
        .then(data => {
            if (mode == 'cf') {
                if (data['status'] == "FAILED") {
                    return waitPromise(500).then(function(res) {
                        return fetch_user(mode, i, retries - 1);
                    });
                }
                
                cf_user_data[i] = data;
                done[i] = 1;
            }
            else if (mode == 'uva')
                uva_ac[i] = data[0]['ac'], uva_ac_newest[i] = data[0]['activity'][1];
            else if (mode == 'icpc')
                icpc_ac[i] = data[0]['ac'], icpc_ac_newest[i] = data[0]['activity'][1];
        })
        .catch(err => {
            return waitPromise(500).then(function(res) {
                return fetch_user(mode, i, retries - 1);
            });
        });
}

function parse_user_data(d, cb) {
    now = Date.now();
    
    for (var i = 0; i < user_name.length; ++i)
    {
        for (j in d[i]['result'])
        {
            var sub = d[i]['result'][j];
            if (sub['verdict'] == 'OK')
            {
                var code = String(sub['problem']['contestId']) + sub['problem']['index'];
                // All-time AC submissions
                cf_ac[i].add(code);
                // AC submissions in the last 7 days
                if ((now - sub['creationTimeSeconds'] * 1000) / (1000 * 60 * 60 * 24) < 7)
                    cf_ac_newest[i].add(code);
            }
        }
    }

    cb();
}

function parse_ratings_data(d, cb) {
    for (i in d['result'])
    {
        var cf_idx = user_cf.indexOf(d['result'][i]['handle']);
        rating[cf_idx] = d['result'][i]['rating'];
        //rating[cf_idx] = d['result'][i]['maxRating'];
    }

    cb();
}

function sort_with_indices(toSort) {
    // Source: https://stackoverflow.com/questions/3730510/javascript-sort-array-and-return-an-array-of-indicies-that-indicates-the-positi
    for (var i = 0; i < toSort.length; i++) {
        toSort[i] = [toSort[i], i];
    }
    toSort.sort(function(left, right) {
        return left[0] > right[0] ? -1 : 1;
    });
    toSort.sortIndices = [];
    for (var j = 0; j < toSort.length; j++) {
        toSort.sortIndices.push(toSort[j][1]);
        toSort[j] = toSort[j][0];
    }
    return toSort;
}

function print_data() {
    // All-time results
    var scores = Array.from(user_name, x => 0);
    for (var i = 0; i < user_name.length; ++i)
        scores[i] = cf_ac[i].size + uva_ac[i] + icpc_ac[i];
    
    sort_with_indices(scores);

    var obj = {table: []};
    for (var i = 0; i < user_name.length; ++i) {
        var c = scores.sortIndices[i];
        obj.table.push({
            user : user_name[c],
            cf_rating : rating[c],
            cf_ac : cf_ac[c].size,
            uva_ac : uva_ac[c],
            icpc_ac : icpc_ac[c],
            score : scores[i]
        });
    }
    var json = JSON.stringify(obj);
    fs.writeFile('/home1/studenti/pnikic/public_html/ldr/results.json', json, 'utf8', () => {});

    // Last 7 days results
    scores = Array.from(user_name, x => 0);
    for (var i = 0; i < user_name.length; ++i)
        scores[i] = cf_ac_newest[i].size + uva_ac_newest[i] + icpc_ac_newest[i];
    
    sort_with_indices(scores);

    obj = {table: []};
    for (var i = 0; i < user_name.length; ++i) {
        var c = scores.sortIndices[i];
        obj.table.push({
            user : user_name[c],
            cf_rating : rating[c],
            cf_ac : cf_ac_newest[c].size,
            uva_ac : uva_ac_newest[c],
            icpc_ac : icpc_ac_newest[c],
            score : scores[i]
        });
    }
    var json = JSON.stringify(obj);
    fs.writeFile('/home1/studenti/pnikic/public_html/ldr/results_newest.json', json, 'utf8', () => {});
    
    // Log data about last update
    fs.writeFile('/home1/studenti/pnikic/public_html/ldr/results_time.txt', Date(), () => {
        success = true;
    });
}

// Main
setInterval(function() {
    if (!success) {
        var msg = Date() + '\n' + 'There is some problem with the servers\n' +
            ' CF: ' + String(cf_ac.map(x => x.size)) +
            '\nUVa: ' + String(uva_ac) +
            '\nCF_ratings: ' + String(done_rat) + '\n';
        fs.writeFile(log_file, msg, {flag : 'a'}, () => {});
    }

    // New iteration of fetching data
    success = false;
    done_rat = 0;
    done = Array.from(user_cf, x => 0)
    
    fetchRatings()
        .catch(err => {
            var msg = Date() + '\n' + 'Error: Fetching user ratings\n';
            fs.writeFile(log_file, msg, {flag : 'a'}, () => {});
        });
    
    for (var i = 0; i < user_name.length; ++i) {
        if (user_cf[i].length > 2)
            fetch_user('cf', i)
            .catch(err => {
                var msg = Date() + '\n' + 'Error: Fetching CF user: ' + err + '\n';
                fs.writeFile(log_file, msg, {flag : 'a'}, () => {});
            });

        if (user_uva[i].length > 0)
            fetch_user('uva', i)
            .catch(err => {
                var msg = Date() + '\n' + 'Error: Fetching UVa user: ' + err + '\n';
                fs.writeFile(log_file, msg, {flag : 'a'}, () => {});
            });
        
        if (user_icpc[i].length > 0)
            fetch_user('icpc', i)
            .catch(err => {
                var msg = Date() + '\n' + 'Error: Fetching UVa ICPC user: ' + err + '\n';
                fs.writeFile(log_file, msg, {flag : 'a'}, () => {});
            });
    }
}, 60000)

setInterval(function() {
    // Regular interval check if all data is fetched    
    if (!success) {        
        var good = 0;
        for (var i = 0; i < done.length; ++i) {
            if (user_cf[i].length > 2)
                good = good + done[i];
            else
                good += 1;
        }
        
        if (good == done.length && done_rat == 1) {
            parse_ratings_data(ratings_data, function() {
                parse_user_data(cf_user_data, print_data);
            });
            
            // setTimeout(() => {
            //     print_data(); // Usually triggers 'success = true'
            // }, 3000);
        }
    }
}, 1000)
