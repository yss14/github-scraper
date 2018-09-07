var pc = require('./profile_contribs.js');
/**
 * profile method scrapes a given GitHub user profile
 * @param {string} username - a valid GitHub username
 * @param {function} callback - the callback we should call after scraping
 *  a callback passed into this method should accept two parameters:
 *  @param {objectj} error an error object (set to null if no error occurred)
 *  @param {object} data - the complete GitHub Profile for the username
 */
module.exports = function profile($, url, callback) {
  var data = { url: url };

  data.img = $('.avatar').attr('src');
  var parts = data.img.split('/');
  data.uid = parseInt(parts[parts.length-1].split('?')[0], 10);

  // Profile Stats (Navigation)
  var stats = $('.Counter').map(function (i) {
    var stat = $(this).text();
    // thousands
    if (stat.indexOf('k') > -1) {
      stat = parseFloat(stat.replace('k', ''), 10) * 1000;
    } else {
      stat = parseInt(stat, 10);
    }
    return stat;
  });
  data.repos     = stats[0];
  data.stars     = stats[1]; // number of repositories user has starred
  data.followers = stats[2]; // number of people folling this user
  data.following = stats[3]; // number of people this user is following

  // Pinned Repos
  data.pinned = [];
  var p = '.pinned-repo-item-content:nth-of-type('
  var urls = $('.pinned-repo-item-content a.text-bold')
  for (var i = 0; i < $('.pinned-repo-item-content').length; i++) {
    var pin = {
      url: urls[i].attribs.href,
      // Want More? see: https://github.com/nelsonic/github-scraper/issues/78
    }
    data.pinned.push(pin);
  }

  // // General Info
  data.worksfor = $('.p-org').first().text().trim();      // Works for
  data.location = $('.octicon-location').parent().text().trim(); // Location
  data.fullname = $('.vcard-fullname').text().trim();            // Full Name
  data.email    = ($('.u-email').innerText || '').trim();                     // email address
  data.website  = $('.u-url').first().text();                // Website
  // data.joined   = $('.join-date').attr('datetime');       // Joined GitHub
  data.avatar   = $('.avatar').attr('src');               // Profile pic

  // Contributions to Open Source in the past 12 months
  data.contribs = parseInt($('.js-contribution-graph .text-normal').text().trim()
    .split(' contributions')[0].replace(',', ''), 10);

  // Contribution Matrix
  data = pc($, data);

  // List of (Public) organizations from profile
  var orgs = $('.avatar-group-item');
  data.orgs = {}; // https://github.com/nelsonic/github-scraper/issues/80
  orgs.map(function (i) {
    var url = orgs[i].attribs.href.replace('/', '');
    var img = orgs[i].children[0].attribs.src; // org org-avatar-image
    data.orgs[url] = img;
  })

  // GitHub Developer Program member?
  var member = $('.member-badge');
  if(member && member[0] && member[0].attribs.href === 'https://developer.github.com') {
    data.developerprogram = true;
  }
  callback(null, data);
  // add task to arana to scrape /{username}?tab=repositories after profile!
}
