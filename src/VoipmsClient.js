const axios = require('axios');
const logger = require('./Logger');

class VoipmsClient {
    constructor() {
        this.apiUrl = 'https://voip.ms/api/v1/rest.php';
        this.username = process.env.VOIPMS_API_USERNAME;
        this.password = process.env.VOIPMS_API_PASSWORD;
        this.timeout = parseInt(process.env.API_TIMEOUT) || 30000;
    }

    async call(method, params = {}) {
        logger.apiRequest(method, params);

        try {
            const url = new URL(this.apiUrl);
            url.searchParams.append('api_username', this.username);
            url.searchParams.append('api_password', this.password);
            url.searchParams.append('method', method);

            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== null) {
                    url.searchParams.append(key, params[key]);
                }
            });

            const response = await axios.get(url.toString(), {
                timeout: this.timeout
            });

            const data = response.data;

            if (data.status === 'error' || data.status === 'no_data') {
                logger.apiResponse(method, false, data);
                return data;
            }

            logger.apiResponse(method, true);
            return data;

        } catch (error) {
            logger.error(`VoIP.ms API Error: ${method}`, {
                message: error.message,
                params
            });
            throw error;
        }
    }

    // General/Utility Methods
    async getLanguages(params = {}) { return this.call('getLanguages', params); }
    async getCountries(params = {}) { return this.call('getCountries', params); }
    async getServersInfo(params = {}) { return this.call('getServersInfo', params); }
    async getIP(params = {}) { return this.call('getIP', params); }
    async getProvinces(params = {}) { return this.call('getProvinces', params); }
    async getStates(params = {}) { return this.call('getStates', params); }
    async getRateCentersCAN(params = {}) { return this.call('getRateCentersCAN', params); }
    async getRateCentersUSA(params = {}) { return this.call('getRateCentersUSA', params); }
    async getTimezones(params = {}) { return this.call('getTimezones', params); }
    async getCarriers(params = {}) { return this.call('getCarriers', params); }

    // Account Management
    async getSubAccounts(params = {}) { return this.call('getSubAccounts', params); }
    async createSubAccount(params = {}) { return this.call('createSubAccount', params); }
    async setSubAccount(params = {}) { return this.call('setSubAccount', params); }
    async delSubAccount(params = {}) { return this.call('delSubAccount', params); }
    async getRegistrationStatus(params = {}) { return this.call('getRegistrationStatus', params); }
    async getAllowedCodecs(params = {}) { return this.call('getAllowedCodecs', params); }
    async getAuthTypes(params = {}) { return this.call('getAuthTypes', params); }
    async getDeviceTypes(params = {}) { return this.call('getDeviceTypes', params); }
    async getDTMFModes(params = {}) { return this.call('getDTMFModes', params); }
    async getLockInternational(params = {}) { return this.call('getLockInternational', params); }
    async getMusicOnHold(params = {}) { return this.call('getMusicOnHold', params); }
    async getNAT(params = {}) { return this.call('getNAT', params); }
    async getProtocols(params = {}) { return this.call('getProtocols', params); }
    async getRoutes(params = {}) { return this.call('getRoutes', params); }

    // DID Management
    async getDIDsInfo(params = {}) { return this.call('getDIDsInfo', params); }
    async getDIDsCAN(params = {}) { return this.call('getDIDsCAN', params); }
    async getDIDsUSA(params = {}) { return this.call('getDIDsUSA', params); }
    async getDIDsInternationalGeographic(params = {}) { return this.call('getDIDsInternationalGeographic', params); }
    async getDIDsInternationalNational(params = {}) { return this.call('getDIDsInternationalNational', params); }
    async getDIDsInternationalTollFree(params = {}) { return this.call('getDIDsInternationalTollFree', params); }
    async getDIDCountries(params = {}) { return this.call('getDIDCountries', params); }
    async orderDID(params = {}) { return this.call('orderDID', params); }
    async orderDIDVirtual(params = {}) { return this.call('orderDIDVirtual', params); }
    async orderTollFree(params = {}) { return this.call('orderTollFree', params); }
    async orderVanity(params = {}) { return this.call('orderVanity', params); }
    async orderDIDInternationalGeographic(params = {}) { return this.call('orderDIDInternationalGeographic', params); }
    async orderDIDInternationalNational(params = {}) { return this.call('orderDIDInternationalNational', params); }
    async orderDIDInternationalTollFree(params = {}) { return this.call('orderDIDInternationalTollFree', params); }
    async backOrderDIDUSA(params = {}) { return this.call('backOrderDIDUSA', params); }
    async backOrderDIDCAN(params = {}) { return this.call('backOrderDIDCAN', params); }
    async cancelDID(params = {}) { return this.call('cancelDID', params); }
    async connectDID(params = {}) { return this.call('connectDID', params); }
    async unconnectDID(params = {}) { return this.call('unconnectDID', params); }
    async setDIDInfo(params = {}) { return this.call('setDIDInfo', params); }
    async setDIDRouting(params = {}) { return this.call('setDIDRouting', params); }
    async setDIDVoicemail(params = {}) { return this.call('setDIDVoicemail', params); }
    async setDIDPOP(params = {}) { return this.call('setDIDPOP', params); }
    async setDIDBillingType(params = {}) { return this.call('setDIDBillingType', params); }
    async searchDIDsCAN(params = {}) { return this.call('searchDIDsCAN', params); }
    async searchDIDsUSA(params = {}) { return this.call('searchDIDsUSA', params); }
    async searchTollFreeCanUS(params = {}) { return this.call('searchTollFreeCanUS', params); }
    async searchTollFreeUSA(params = {}) { return this.call('searchTollFreeUSA', params); }
    async searchVanity(params = {}) { return this.call('searchVanity', params); }
    async getPortability(params = {}) { return this.call('getPortability', params); }

    // Voicemail
    async getVoicemails(params = {}) { return this.call('getVoicemails', params); }
    async createVoicemail(params = {}) { return this.call('createVoicemail', params); }
    async setVoicemail(params = {}) { return this.call('setVoicemail', params); }
    async delVoicemail(params = {}) { return this.call('delVoicemail', params); }
    async getVoicemailFolders(params = {}) { return this.call('getVoicemailFolders', params); }
    async getVoicemailMessages(params = {}) { return this.call('getVoicemailMessages', params); }
    async getVoicemailMessageFile(params = {}) { return this.call('getVoicemailMessageFile', params); }
    async sendVoicemailEmail(params = {}) { return this.call('sendVoicemailEmail', params); }
    async markListenedVoicemailMessage(params = {}) { return this.call('markListenedVoicemailMessage', params); }
    async markUrgentVoicemailMessage(params = {}) { return this.call('markUrgentVoicemailMessage', params); }
    async moveFolderVoicemailMessage(params = {}) { return this.call('moveFolderVoicemailMessage', params); }
    async delMessages(params = {}) { return this.call('delMessages', params); }
    async getVoicemailSetups(params = {}) { return this.call('getVoicemailSetups', params); }
    async getVoicemailAttachmentFormats(params = {}) { return this.call('getVoicemailAttachmentFormats', params); }
    async getPlayInstructions(params = {}) { return this.call('getPlayInstructions', params); }

    // SMS/MMS
    async getSMS(params = {}) { return this.call('getSMS', params); }
    async getMMS(params = {}) { return this.call('getMMS', params); }
    async getMediaMMS(params = {}) { return this.call('getMediaMMS', params); }
    async sendSMS(params = {}) { return this.call('sendSMS', params); }
    async sendMMS(params = {}) { return this.call('sendMMS', params); }
    async deleteSMS(params = {}) { return this.call('deleteSMS', params); }
    async deleteMMS(params = {}) { return this.call('deleteMMS', params); }
    async setSMS(params = {}) { return this.call('setSMS', params); }

    // CDR
    async getCDR(params = {}) { return this.call('getCDR', params); }
    async getResellerCDR(params = {}) { return this.call('getResellerCDR', params); }
    async getCallTypes(params = {}) { return this.call('getCallTypes', params); }
    async getCallBilling(params = {}) { return this.call('getCallBilling', params); }
    async getCallAccounts(params = {}) { return this.call('getCallAccounts', params); }

    // IVR
    async getIVRs(params = {}) { return this.call('getIVRs', params); }
    async setIVR(params = {}) { return this.call('setIVR', params); }
    async delIVR(params = {}) { return this.call('delIVR', params); }

    // Forwarding
    async getForwardings(params = {}) { return this.call('getForwardings', params); }
    async setForwarding(params = {}) { return this.call('setForwarding', params); }
    async delForwarding(params = {}) { return this.call('delForwarding', params); }

    // Callbacks
    async getCallbacks(params = {}) { return this.call('getCallbacks', params); }
    async setCallback(params = {}) { return this.call('setCallback', params); }
    async delCallback(params = {}) { return this.call('delCallback', params); }

    // DISA
    async getDISAs(params = {}) { return this.call('getDISAs', params); }
    async setDISA(params = {}) { return this.call('setDISA', params); }
    async delDISA(params = {}) { return this.call('delDISA', params); }

    // Time Conditions
    async getTimeConditions(params = {}) { return this.call('getTimeConditions', params); }
    async setTimeCondition(params = {}) { return this.call('setTimeCondition', params); }
    async delTimeCondition(params = {}) { return this.call('delTimeCondition', params); }

    // Ring Groups
    async getRingGroups(params = {}) { return this.call('getRingGroups', params); }
    async setRingGroup(params = {}) { return this.call('setRingGroup', params); }
    async delRingGroup(params = {}) { return this.call('delRingGroup', params); }

    // Call Hunting
    async getCallHuntings(params = {}) { return this.call('getCallHuntings', params); }
    async setCallHunting(params = {}) { return this.call('setCallHunting', params); }
    async delCallHunting(params = {}) { return this.call('delCallHunting', params); }

    // Caller ID Filtering
    async getCallerIDFiltering(params = {}) { return this.call('getCallerIDFiltering', params); }
    async setCallerIDFiltering(params = {}) { return this.call('setCallerIDFiltering', params); }
    async delCallerIDFiltering(params = {}) { return this.call('delCallerIDFiltering', params); }

    // SIP URI
    async getSIPURIs(params = {}) { return this.call('getSIPURIs', params); }
    async setSIPURI(params = {}) { return this.call('setSIPURI', params); }
    async delSIPURI(params = {}) { return this.call('delSIPURI', params); }

    // Call Queues
    async getQueues(params = {}) { return this.call('getQueues', params); }
    async setQueue(params = {}) { return this.call('setQueue', params); }
    async delQueue(params = {}) { return this.call('delQueue', params); }
    async getStaticMembers(params = {}) { return this.call('getStaticMembers', params); }
    async setStaticMember(params = {}) { return this.call('setStaticMember', params); }
    async delStaticMember(params = {}) { return this.call('delStaticMember', params); }
    async getJoinWhenEmptyTypes(params = {}) { return this.call('getJoinWhenEmptyTypes', params); }
    async getReportEstimatedHoldTime(params = {}) { return this.call('getReportEstimatedHoldTime', params); }
    async getRingStrategies(params = {}) { return this.call('getRingStrategies', params); }

    // Conference
    async getConference(params = {}) { return this.call('getConference', params); }
    async setConference(params = {}) { return this.call('setConference', params); }
    async delConference(params = {}) { return this.call('delConference', params); }
    async getConferenceMembers(params = {}) { return this.call('getConferenceMembers', params); }
    async setConferenceMember(params = {}) { return this.call('setConferenceMember', params); }
    async delConferenceMember(params = {}) { return this.call('delConferenceMember', params); }
    async addMemberToConference(params = {}) { return this.call('addMemberToConference', params); }
    async delMemberFromConference(params = {}) { return this.call('delMemberFromConference', params); }
    async getConferenceRecordings(params = {}) { return this.call('getConferenceRecordings', params); }
    async getConferenceRecordingFile(params = {}) { return this.call('getConferenceRecordingFile', params); }

    // Recordings
    async getRecordings(params = {}) { return this.call('getRecordings', params); }
    async getRecordingFile(params = {}) { return this.call('getRecordingFile', params); }
    async setRecording(params = {}) { return this.call('setRecording', params); }
    async delRecording(params = {}) { return this.call('delRecording', params); }

    // Phonebook
    async getPhonebook(params = {}) { return this.call('getPhonebook', params); }
    async setPhonebook(params = {}) { return this.call('setPhonebook', params); }
    async delPhonebook(params = {}) { return this.call('delPhonebook', params); }
    async getPhonebookGroup(params = {}) { return this.call('getPhonebookGroup', params); }
    async setPhonebookGroup(params = {}) { return this.call('setPhonebookGroup', params); }
    async delPhonebookGroup(params = {}) { return this.call('delPhonebookGroup', params); }

    // Fax
    async getFaxNumbersInfo(params = {}) { return this.call('getFaxNumbersInfo', params); }
    async orderFaxNumber(params = {}) { return this.call('orderFaxNumber', params); }
    async cancelFaxNumber(params = {}) { return this.call('cancelFaxNumber', params); }
    async getFaxMessages(params = {}) { return this.call('getFaxMessages', params); }
    async getFaxMessagePDF(params = {}) { return this.call('getFaxMessagePDF', params); }
    async sendFaxMessage(params = {}) { return this.call('sendFaxMessage', params); }
    async deleteFaxMessage(params = {}) { return this.call('deleteFaxMessage', params); }
    async moveFaxMessage(params = {}) { return this.call('moveFaxMessage', params); }
    async mailFaxMessagePDF(params = {}) { return this.call('mailFaxMessagePDF', params); }
    async getFaxFolders(params = {}) { return this.call('getFaxFolders', params); }
    async setFaxFolder(params = {}) { return this.call('setFaxFolder', params); }
    async delFaxFolder(params = {}) { return this.call('delFaxFolder', params); }
    async getEmailToFax(params = {}) { return this.call('getEmailToFax', params); }
    async setEmailToFax(params = {}) { return this.call('setEmailToFax', params); }
    async delEmailToFax(params = {}) { return this.call('delEmailToFax', params); }
    async setFaxNumberInfo(params = {}) { return this.call('setFaxNumberInfo', params); }
    async setFaxNumberEmail(params = {}) { return this.call('setFaxNumberEmail', params); }
    async setFaxNumberURLCallback(params = {}) { return this.call('setFaxNumberURLCallback', params); }
    async xxxxxctFAX(params = {}) { return this.call('connectFAX', params); }
    async unconnectFAX(params = {}) { return this.call('unconnectFAX', params); }
    async getFaxProvinces(params = {}) { return this.call('getFaxProvinces', params); }
    async getFaxStates(params = {}) { return this.call('getFaxStates', params); }
    async getFaxRateCentersCAN(params = {}) { return this.call('getFaxRateCentersCAN', params); }
    async getFaxRateCentersUSA(params = {}) { return this.call('getFaxRateCentersUSA', params); }
    async searchFaxAreaCodeCAN(params = {}) { return this.call('searchFaxAreaCodeCAN', params); }
    async searchFaxAreaCodeUSA(params = {}) { return this.call('searchFaxAreaCodeUSA', params); }
    async getFaxNumbersPortability(params = {}) { return this.call('getFaxNumbersPortability', params); }

    // Billing
    async getBalance(params = {}) { return this.call('getBalance', params); }
    async getCharges(params = {}) { return this.call('getCharges', params); }
    async addCharge(params = {}) { return this.call('addCharge', params); }
    async getDeposits(params = {}) { return this.call('getDeposits', params); }
    async addPayment(params = {}) { return this.call('addPayment', params); }
    async getTransactionHistory(params = {}) { return this.call('getTransactionHistory', params); }
    async getResellerBalance(params = {}) { return this.call('getResellerBalance', params); }
    async getPackages(params = {}) { return this.call('getPackages', params); }
    async getClientPackages(params = {}) { return this.call('getClientPackages', params); }
    async getRates(params = {}) { return this.call('getRates', params); }
    async getTerminationRates(params = {}) { return this.call('getTerminationRates', params); }
    async getBalanceManagement(params = {}) { return this.call('getBalanceManagement', params); }

    // Clients
    async getClients(params = {}) { return this.call('getClients', params); }
    async setClient(params = {}) { return this.call('setClient', params); }
    async delClient(params = {}) { return this.call('delClient', params); }
    async signupClient(params = {}) { return this.call('signupClient', params); }
    async getClientThreshold(params = {}) { return this.call('getClientThreshold', params); }
    async setClientThreshold(params = {}) { return this.call('setClientThreshold', params); }
    async getBackOrders(params = {}) { return this.call('getBackOrders', params); }

    // E911
    async e911Info(params = {}) { return this.call('e911Info', params); }
    async e911Provision(params = {}) { return this.call('e911Provision', params); }
    async e911ProvisionManually(params = {}) { return this.call('e911ProvisionManually', params); }
    async e911Update(params = {}) { return this.call('e911Update', params); }
    async e911Validate(params = {}) { return this.call('e911Validate', params); }
    async e911Cancel(params = {}) { return this.call('e911Cancel', params); }
    async e911AddressTypes(params = {}) { return this.call('e911AddressTypes', params); }

    // LNP
    async addLNPPort(params = {}) { return this.call('addLNPPort', params); }
    async addLNPFile(params = {}) { return this.call('addLNPFile', params); }
    async getLNPList(params = {}) { return this.call('getLNPList', params); }
    async getLNPListStatus(params = {}) { return this.call('getLNPListStatus', params); }
    async getLNPDetails(params = {}) { return this.call('getLNPDetails', params); }
    async getLNPStatus(params = {}) { return this.call('getLNPStatus', params); }
    async getLNPNotes(params = {}) { return this.call('getLNPNotes', params); }
    async getLNPAttachList(params = {}) { return this.call('getLNPAttachList', params); }
    async getLNPAttach(params = {}) { return this.call('getLNPAttach', params); }
}

module.exports = new VoipmsClient();
