/**
 * Copyright 2020 Tomas Hozza
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
 * OF SUCH DAMAGE.
 */

/**
 * Data used by the script
 */
var scriptDataObject = {
  'STATUS_SPREADSHEET_URL': '<URL>',
  'STATUS_FORM_URL': '<URL>',
  'TEAM_EMAILS': ['member1@example.com', 'member2@example.com'],

  'FORM_TITLE': Utilities.formatString('Status for week #%s-%s', getWeekNumber_(), new Date().getYear()),
  'FORM_DESCRIPTION': 'Please provide status report for the current week. Include any links to pull requests ' +
                 '/ bugs / documents / blogs / etc., that may be relevant. Keep it short and focus on things ' +
                 'that could be important for other teams to know about.',

  'FORM_SECTIONS': {
    'TIME_SPENT_SECTION': {
      'TITLE': 'Time spent this week',
      'HELP_TEXT': 'Please estimate how much of your work time did you spend this week on the contribution ' +
                 'areas listed below. Exclude any days off or holidays when calculating percent.\n\n' + 
                 'Try to map as much of your work as possible to our products. This means that if you ' +
                 'did some work in upstream, but it originated as a request from a customer in RHEL, then ' +
                 'mark it as such. A similar approach should be taken for the time spent on learning new ' +
                 'things and technologies. Use the Upstream-Community contribution area for pure proactive ' +
                 'work in upstream or Fedora.\n\n' +
                 'SUM OF ALL PERCENTS MUST BE EXACTLY 100%!!!',
      'REQUIRED': true, // OPTIONAL
      'CONTRIBUTION_AREAS': [
        'Security Issues',
        'Unplanned Customer Work',
        'Upstream-Community',
        'Next Product Release',
        'Project X'
      ]
    },

    'TEXT_SECTIONS': [
      {
        'TITLE': 'Progress this week',
        'HELP_TEXT': '• Please note (1-5) most important things that you worked on this week and what was the result.\n' +
                     '• If possible, please include also links (This is so that also other people and teams can check it).',
        'REQUIRED': true,   // OPTIONAL
        'VALIDATION': getParagraphValidatorMinChars_(10)    // OPTIONAL
      },
      {
        'TITLE': 'Higlights for this week',
        'HELP_TEXT': '• Please note anything that you are proud of and should be shared with other teams ' +
                       '(e.g. a new feature that you implemented in a project you work on; blog post that you\'ve written; ' +
                       'talk on a conference, ...)',
        'REQUIRED': false,
        'VALIDATION': getParagraphValidatorMinChars_(10)
      },
      {
        'TITLE': 'Plan for next 1-2 week',
        'HELP_TEXT': '• Please note (1-3) the most important things that you plan to work on in the next 1-2 weeks.',
        'REQUIRED': true,
        'VALIDATION': getParagraphValidatorMinChars_(10)
      },
      {
        'TITLE': 'Problems / Blockers / Management escalation',
        'HELP_TEXT': '• Please share anything blocking you from proceeding with your duties, which you can not easily ' +
                     'solve (e.g. you need a special hardware for implementing new feature in some project; unresponsive ' +
                     'team/engineer blocking your work; issue with some workflow, ...)\n' +
                     '• Feel free to note anything that you would like to escalate through the management chain.',
        'REQUIRED': false,
        'VALIDATION': getParagraphValidatorMinChars_(10)
      }
    ]
  }
};
