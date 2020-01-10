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
 * Function to remind people to submit status, if they didn't do so yet.
 */
function remindWeekStatusViaEmailMain() {
  Logger.log('remindWeekStatusViaEmailMain() start');
  
  // data used from scriptDataObject
  var form_url = scriptDataObject['STATUS_FORM_URL'];
  var team_emails = scriptDataObject['TEAM_EMAILS'];
  var form = FormApp.openByUrl(form_url);
  
  Logger.log('Using Form: %s', form_url);
  Logger.log('Using Emails: %s', team_emails);
  
  var to_remind_emails = getMissingResponseEmails_(form_url, team_emails);  
  Logger.log('Followig people need to be reminded: %s', to_remind_emails);

  // TODO: make the subject and body configurable
  var email_subject = Utilities.formatString('[Reminder] Provide your weekly status for week #%s of year %s', getWeekNumber_(), new Date().getYear());
  var email_body = Utilities.formatString('Hello.\n\nSince you didn\'t provide your weekly status for week #%s of year %s yet, this is a kind reminder to do so ' +
                                          'using the following Google Form:\n%s\n\nPlease provide your status ASAP!\n\nThank you in advance.\n\n' +
                                          '--\nThis email has been automatically generated.',
                                         getWeekNumber_(),
                                         new Date().getYear(),
                                         form.getPublishedUrl());

  Logger.log('Sending emails to: %s', to_remind_emails);
  Logger.log('Email SUBJ: %s', email_subject);
  Logger.log('Email BODY: %s', email_body);
  
  MailApp.sendEmail(to_remind_emails.join(','), email_subject, email_body);
  
  Logger.log('remindWeekStatusViaEmailMain() end');
}

/********************************************************************************/

/**
 * Main logic for requesting new week's status from team via email.
 */
function notifyWeekStatusViaEmailMain() {
  Logger.log('notifyWeekStatusViaEmailMain() start');
  
  var team_emails = scriptDataObject['TEAM_EMAILS'];
  var form_url = scriptDataObject['STATUS_FORM_URL'];
  var form = FormApp.openByUrl(form_url);
  
  Logger.log('Using Form: %s', form_url);
  Logger.log('Using Emails: %s', team_emails);

  // TODO: make the day of the week, hour and minute configurable
  // calculate date of Thursday in the current week
  var today_noon = new Date(new Date().getYear(), new Date().getMonth(), new Date().getDate(), 23, 59);
  var days_to_thu = 4 - today_noon.getDay();
  var deadline = new Date(today_noon.getTime() + (days_to_thu * 24 * 60 * 60 * 1000));

  // TODO: make the subject and body configurable
  var email_subject = Utilities.formatString('Provide your weekly status for week #%s of year %s', getWeekNumber_(), new Date().getYear());
  var email_body = Utilities.formatString('Hello.\n\nPlease provide your weekly status report for week #%s of ' +
                                          'year %s using the following Google Form:\n%s\n\nPlease do so no later ' +
                                          'than by %s!\n\nThank you in advance.\n\n' +
                                          '--\nThis email has been automatically generated.',
                                         getWeekNumber_(),
                                         new Date().getYear(),
                                         form.getPublishedUrl(),
                                         Utilities.formatDate(deadline, Session.getScriptTimeZone(), "EEE yyyy-MM-dd HH:mm z"));

  // Skip notification for emails that already provided status
  var missing_response_emails = getMissingResponseEmails_(form_url, team_emails);  
  
  Logger.log('Sending emails to: %s', missing_response_emails);
  Logger.log('Email SUBJ: %s', email_subject);
  Logger.log('Email BODY: %s', email_body);
  
  MailApp.sendEmail(missing_response_emails.join(','), email_subject, email_body);
  
  Logger.log('notifyWeekStatusViaEmailMain() end');
}

/********************************************************************************/

/**
 * Main logic for creating new week's status form and sheet.
 *
 * In reality, no new form is created, only an existing Form is re-created by
 * removing its whole content and then creating it from scratch.
 */
function createNewWeeksStatusFormMain() {
  Logger.log('createNewWeeksStatusFormMain() start');
  
  var form_url = scriptDataObject['STATUS_FORM_URL'];
  var spreadsheet_url = scriptDataObject['STATUS_SPREADSHEET_URL'];
  var form_title = scriptDataObject['FORM_TITLE'];
  var form_description = scriptDataObject['FORM_DESCRIPTION'];
  var form_sections = scriptDataObject['FORM_SECTIONS'];
  
  Logger.log('Using Form: %s', form_url);
  Logger.log('Using Spreadsheet: %s', spreadsheet_url);

  // re-create form
  recreateForm_(form_url, spreadsheet_url, form_title, form_description, form_sections);
  
  Logger.log('createNewWeeksStatusFormMain() end');
}

/**
 * Creates submission Form for the current week.
 */
function recreateForm_(form_url, destination_sheet_url, title, description, sections) {
  Logger.log('recreateForm_() start');
  
  // open the given form
  var form = FormApp.openByUrl(form_url);
  // open the destination spreadsheet
  var destination_sheet = SpreadsheetApp.openByUrl(destination_sheet_url)
  
  // unlink form from its current destination
  form.removeDestination();
  // delete all responses after the change of destination spreadsheet.
  // without this, people could not submit a new status, since we are reusing existing form
  form.deleteAllResponses();
  // remove all items in the current form first!
  cleanForm_(form);
  
  // set form properties
  form.setTitle(title);
  form.setDescription(description);
  form.setLimitOneResponsePerUser(true);
  form.setAllowResponseEdits(true);
  form.setCollectEmail(true);
  
  /***** FORM'S CONTENT CREATION START *****/
  
  // Time spent section
  var time_spent_section_data = sections['TIME_SPENT_SECTION'];
  if (time_spent_section_data !== undefined) {
    form.addGridItem()
      .setRequired(time_spent_section_data['REQUIRED'] || false)
      .setTitle(time_spent_section_data['TITLE'])
      .setHelpText(time_spent_section_data['HELP_TEXT'] || '')
      .setRows(time_spent_section_data['CONTRIBUTION_AREAS'])
      .setColumns([
        '0%',
        '10%',
        '20%',
        '30%',
        '40%',
        '50%',
        '60%',
        '70%',
        '80%',
        '90%',
        '100%',
    ]);
  }
  
  // Text sections
  var text_sections_data = sections['TEXT_SECTIONS'];
  if (text_sections_data !== undefined) {
    for each (var section in text_sections_data) {
      form.addParagraphTextItem()
        .setRequired(section['REQUIRED'] || false)
        .setTitle(section['TITLE'])
        .setHelpText(section['HELP_TEXT'] || '')
        .setValidation(section['VALIDATION'] || null); 
    }
  }  
  
  /***** FORM'S CONTENT CREATION END *****/

  // Set form's destination spreadsheet. This ensures that new sheet within the spreadsheet is created.
  // Linking destination after the form is fully created ensures that the sheet contains correct columns
  form.setDestination(FormApp.DestinationType.SPREADSHEET, destination_sheet.getId());
  var destination_sheet_name = Utilities.formatString("%s-%s", getWeekNumber_(), new Date().getYear());
  renameDestinationSheet_(SpreadsheetApp.openById(form.getDestinationId()), destination_sheet_name);      

  Logger.log('Published URL: ' + form.getPublishedUrl());
  Logger.log('Editor URL: ' + form.getEditUrl());
  
  Logger.log('recreateForm_() end');
}