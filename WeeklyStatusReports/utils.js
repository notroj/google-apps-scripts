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
 * Returns string with the number of the current week.
 */
function getWeekNumber_() {
  return Number(Utilities.formatDate(new Date(), "GMT", "w"));
}

/**
 * Returns ParagraphTextValidation object for Form, which ensures that the input is at least 'chars' long.
 */
function getParagraphValidatorMinChars_(chars) {
  return FormApp.createParagraphTextValidation()
    .setHelpText(Utilities.formatString('Answer must be at least %s characters long.', chars))
    .requireTextLengthGreaterThanOrEqualTo(chars)
    .build();
}

/**
 * Renames the form's destination sheet in given spreadsheet to given name and backes up any existing sheet with such name.
 */
function renameDestinationSheet_(spreadsheet, sheet_name) {
  Logger.log('renameDestinationSheet_() start');
  
  // Ensure that all pending spreadsheet actions are completed before we proceed
  SpreadsheetApp.flush();
  // The 1st sheet is ALWAYS the destination for form, so set it as active
  spreadsheet.setActiveSheet(spreadsheet.getSheets()[0]);
  
  Logger.log('Sheets in spreadsheet Name: %s URL: %s', spreadsheet.getName(), spreadsheet.getUrl());
  for each (var item in spreadsheet.getSheets()) {
    Logger.log('Sheet: %s', item.getName());
  }
  Logger.log('1st sheet name: %s', spreadsheet.getActiveSheet().getName());
  
  // Ensure that sheet with the given name does not already exist in the spreadsheet
  var existing_sheet = spreadsheet.getSheetByName(sheet_name);
  
  // The sheet with such name exists and it is not the active sheet
  if (existing_sheet !== null && existing_sheet.getSheetId() !== spreadsheet.getSheets()[0].getSheetId()) {
    Logger.log('Backing up existing sheet with the desired name');
    var old_active_sheet = spreadsheet.getActiveSheet();
    spreadsheet.setActiveSheet(existing_sheet);
    spreadsheet.renameActiveSheet(Utilities.formatString('%s (backup at %s)', existing_sheet.getSheetName(), Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd HH:mm:ss z')));
    Logger.log('Backed up existing sheet as: %s', spreadsheet.getActiveSheet().getName());
    spreadsheet.setActiveSheet(old_active_sheet);
  }
  
  // Rename the destination sheet accordingly
  Logger.log('Renaming active sheet to: %s', sheet_name);
  spreadsheet.renameActiveSheet(sheet_name);

  Logger.log('renameDestinationSheet_() end');
}

/**
 * Removes all items from the given form.
 */
function cleanForm_(form) {
  Logger.log('cleanForm_() start');
  
  for each (var item in form.getItems()) {
    form.deleteItem(item);
  }
  
  Logger.log('cleanForm_() end');
}

/**
 * Get list of emails of people who didn't provide a response using the provided form.
 */
function getMissingResponseEmails_(form_url, emails) {
  Logger.log('getMissingResponseEmails_() start');
  
  var form = FormApp.openByUrl(form_url);
  var form_responses = form.getResponses();
  
  var responses_emails = [];
  
  // gather email addresses of people, who already responded
  for each (var response in form_responses) {
    Logger.log('Found response from %s on %s', response.getRespondentEmail(), response.getTimestamp());
    responses_emails.push(response.getRespondentEmail());
  }
  
  // create list of people, who need to be reminded
  var missing_response_emails = [];
  
  for each (var email in emails) {
    if (responses_emails.indexOf(email) == -1) {
      Logger.log('Missing response from %s', email);
      missing_response_emails.push(email);
    }
  }
  
  Logger.log('getMissingResponseEmails_() end');
  return missing_response_emails;
}