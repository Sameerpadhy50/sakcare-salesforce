import { LightningElement, track, api, wire } from 'lwc';
import invokeAgentAction from '@salesforce/apex/ChatBotAiInvoker.invokeAgentAction';
import getCurrentUserPhotoUrl from '@salesforce/apex/ChatBotUserInfoController.getCurrentUserPhotoUrl';

import botLogoRes from '@salesforce/resourceUrl/botLogo';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import microphone from '@salesforce/resourceUrl/microphone_sakcare';
import { CurrentPageReference } from 'lightning/navigation';
import getConfig from "@salesforce/apex/ChatConfigService.getConfig";




export default class ChatBotUI extends LightningElement {
    @api selectedAgent ;
    @api falseAgent;
    @api availableActions;
    @track messages = [];
    @track isLoading = false;
    @track socialOpen = false;  
    @track showCallAssistant = false;
    @api openOnLoad;
    @api isGrid = false;
    @api chatBotTitle = 'Sakcare Agent';
    @api isExpanded = false;
    @api isChatActive = false;
    @api userBubbleTheme = 'Blue';
    @api userBubbleCustom;
    @api sch;
    @api isutility;
   // @track activeAgent; //commented to Bug fix
    
    @api autoOpen;
    // _autoOpen = false;

    userInput = '';
    sessionId = '';
    isChatOpen = false;
    botLogo = botLogoRes;
    microphoneIcon = microphone;
    userPhoto = '';
    pageKey = '';
    config = {};
    showSocialOpen;
    configDislikeResponse;
    configLikeResponse;
    configReadAloud;
    configRequestRegenerate;
    configSelectAgent;
    configVideoAgent;
    configCopyResponseText;
    configCallAgent;
    // configChatBotTitle;
    // configUserBubbleTheme
    configAgentApiName;
    
    @api isGrid_targetConfig;
    isGlobalAction;
    isFlow;
    @api dynamicValue;
    @api isOpen;
    @api globalAction;
    _autoOpen = false;
    _props;
    @api
    set props(value) {
        this._props = value;
        console.log("Received from parent:", JSON.stringify(value));
        if (this._props) {
            this.isGlobalAction = true;

            this.isGrid = true;
        }
    }

    get props() {
        return this._props;
    }

    // @api
    // get autoOpen() {
    //     return this._autoOpen;
    // }

    // set autoOpen(value) {
    //     this._autoOpen = value;
    //     console.log('🔥 autoOpen updated from Aura:', value);

    //     // React to the change immediately
    //     if (value) {
    //         this.showChat();
    //     } else {
    //         this.hideChat();
    //     }
    // }

    // showChat() {
    //     console.log('Chatbot UI is OPEN');
    // }

    // hideChat() {
    //     console.log('Chatbot UI is CLOSED');
    // }




    @wire(CurrentPageReference)
    getPageRef(pageRef) {
        if (!pageRef) return;

        console.log("📌 PageRef:", pageRef);
        console.log("📌 PageRef type:", pageRef.type);

        let newKey = null;
        

        console.log('the understanding global action value',this.props)
        if(this.isGlobalAction){
           newKey = "global_action_page"; 
        }else if (this.isutility) {
            // 👉 Utility bar always overrides pageRef
            console.log('⚡ Utility bar detected via isutility flag');
            newKey = "utility_bar";

        } else if (this.isFlow){
            newKey = "flow_page";
        }
        else {
            // Normal pages
            switch (pageRef.type) {
                case "standard__recordPage":
                    newKey = "standard__recordpage"; break;
                case "standard__namedPage":
                    newKey = "standard__namedpage"; break;
                case "standard__app":
                    newKey = "standard__apppage"; break;
                case "standard__navItemPage":
                    newKey = "standard__navItemPage"; break;
                case "comm__namedPage":
                    newKey = "comm__namedPage"; break;
            }
        }

        // Prevent repeated calls
        if (newKey !== this.pageKey) {
            this.pageKey = newKey;
            console.log("📌 Final pageKey:", this.pageKey);

            // Utility bar config rules
            if (this.pageKey === "utility_bar") {
                this.isGrid = true;
            }
             if (this.pageKey === "global_action_page") {
                this.isGrid = true;
            }
            if(this.pageKey === "flow_page"){
                this.isGrid = true;
            }

            this.loadConfig();
        }
    }

    loadConfig() {
        if (!this.pageKey) return;

        console.log(" Loading config for:", this.pageKey);

        getConfig({ pageKey: this.pageKey })
            .then(result => {
                console.log("CONFIG RESULT:", result);

                this.config = result;

                this.showSocialOpen = result.Social_Links__c;
                this.isGrid = result.IsSticky__c;
                this.configCallAgent = result.Call_Agent__c;
                this.configDislikeResponse = result.Dislike_Response__c;
                this.configLikeResponse = result.Like_Response__c;
                this.configReadAloud = result.Read_Aloud__c;
                this.configRequestRegenerate = result.Request_Regenerate__c;
                this.configSelectAgent = result.Select_Agent__c;
                this.configVideoAgent = result.Video_Agent__c;
                this.configCopyResponseText = result.Copy_Response_Text__c;
                this.configAgentApiName = result.Agent_api_name__c;
                // this.configChatBotTitle = result.Chatbot_Title__c;
                // this.configUserBubbleTheme = result.Chatbot_Theme__c;

                // this.applyFinalConfig();
                this.chatBotTitle = result.Chatbot_Title__c;
                this.userBubbleTheme = result.Chatbot_Theme__c;
            })
            .catch(error => {
                console.error(" CONFIG ERROR:", error);
            });
    }

    handleSelect(event) {
        const value = event.currentTarget.dataset.value;
        console.log('Selected:', value);
    }



    connectedCallback() {
       


         this.isFlow = !!this.availableActions;
    console.log(" Inside Flow:", this.isFlow);

    if (this.isFlow) {
        this.pageKey = "flow_page";
        this.isGrid = true;   // flows are always grid 
        this.loadConfig();
        return; 
    }
        console.log('autonopen value ::::::::::::::::::::::::::::',this.autoOpen);
        this.isGrid = true;
        // console.log('check theam value',this.userBubbleTheme);
        console.log("value from conn",this.isutility);
        console.log("show the global action value",this.globalAction);
        console.log('the page you are on', this.pageRef);

        if(this.isGrid_targetConfig === true){
            this.isGrid = false;   
        }
        

        if (this.isutility) {
            this.isGrid = true;
        }
        // if(!this.isutility){
        //     this.isGrid = false;
        // }
        if (!this.isGrid) {
            this.setHostPosition();
        }

        // Grid mode → chat always open
        if (this.isGrid) {
            this.isChatOpen = true;
        }
        if (this.isGrid) {
            this.isChatOpen = true;    // ensure the chat shows
            this.isExpanded = true;    // so we get large mode
        }
        // this.setHostPosition();
        this.loadUserPhoto();
        this.applyUserBubbleTheme();

        this.messages = [
            {
                id: Date.now(),
                text: "Hi, I'm SakCare Agent, an AI agent built in Agentforce that can help your all emergency and critical financial queries and connect you with our Experts if needed. This experience, powered entirely by Agentforce, keeps improving daily! Ask me things like, 'I would like to create a dispute request?'",
                isAgent: true,
                time: this.getFormattedTime()
            }

        ];

        //session storage for agent name persistence across refreshes

        //commented for bug fix

// const storedAgent = sessionStorage.getItem('activeAgent');
     
//     if (storedAgent) {
//         console.log('Found stored Agent in Session Storage:📌👌', storedAgent);
//         this.activeAgent = storedAgent;
//         console.log('Retrieved Agent from Session Storage:', this.activeAgent);
//     }
        

       
    }

    renderedCallback() {
        
        // console.log('sdat', this.autoOpen);
        // console.log("Dynamic value from global action:", this.dynamicValue);
        // console.log("Is action open:", this.isOpen);
        // console.log("show the global action value", this.globalAction);

        //  console.log('RENDE Callback::: false',this.falseAgent);
        // console.log('RENDER Callback::: selectedAgent',this.selectedAgent);

        

        if (this.isGrid_targetConfig === true && this.isGrid === true) {
        this.isGrid = false;
        this.setHostPosition(); 
        }
        

        this.applyUserBubbleTheme();
        if (!this.isGrid) {
            this.setHostPosition();
        }
        if (this.userBubbleTheme) {
            this.template.host.style.setProperty(
                '--primary-color',
                this.userBubbleTheme
            );
        }
        
    }

    applyFinalConfig() {
    // Chatbot Title
    if (!this.chatBotTitle && this.configChatBotTitle) {
        this.chatBotTitle = this.configChatBotTitle;
    }

    // User Bubble Theme
    if (!this.userBubbleTheme && this.configUserBubbleTheme) {
        this.userBubbleTheme = this.configUserBubbleTheme;
    }
}



    
    

    setHostPosition() {
        const host = this.template.host;
        if (host) {
            host.style.position = 'fixed';
            host.style.bottom = '20px';
            host.style.right = '20px';
            host.style.zIndex = '99';

        }
    }

    async loadUserPhoto() {
        try {
            const url = await getCurrentUserPhotoUrl();
            this.userPhoto = url || '';
            console.log('User photo URL:', this.userPhoto);
        } catch (err) {
            console.error('Could not fetch user photo:', err);
            this.userPhoto = '';
        }
    }

    toggleChat() {
        this.isChatOpen = !this.isChatOpen;
    }

    toggleSocial(event) {
        this.socialOpen = !this.socialOpen;
        event.stopPropagation();
    }

    handleInput(event) {
        this.userInput = event.target.value;
    }

    handleKeyDown(event) {
        if (event.key === 'Enter') {
            this.handleSend();
        }
    }

    getFormattedTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    handleCopy(event) {
        const msgId = event.currentTarget.dataset.id;
        const message = this.messages.find(m => m.id == msgId);
        if (message) {
            navigator.clipboard.writeText(message.text);
            this.showToast('Copied!', 'Agent response copied to clipboard.', 'success');
        }
    }

    handleLike(event) {
        const msgId = event.currentTarget.dataset.id;
        this.showToast('Thank you!', 'You liked this response.', 'success');
        console.log('Liked message ID:', msgId);
    }

    handleDislike(event) {
        const msgId = event.currentTarget.dataset.id;
        this.showToast('Feedback noted', 'We’ll improve future responses.', 'info');
        console.log('Disliked message ID:', msgId);
    }

    handleRetry(event) {
        const msgId = event.currentTarget.dataset.id;
        const msg = this.messages.find(m => m.id == msgId);
        if (msg) {
            this.handleSend(msg.text); // re-send the same query
        }
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(evt);
    }


    // Voice input handler (uses Web Speech API where supported)
    handleVoiceInput() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            window.alert('Speech recognition not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.start();

        // const micBtn = this.template.querySelector('.mic-btn');
        // if (micBtn) micBtn.classList.add('listening');

        recognition.onresult = (evt) => {
            const transcript = evt.results[0][0].transcript;
            this.userInput = transcript;
            this.handleSend();
        };

        recognition.onerror = (err) => {
            console.error('Speech recognition error', err);
        };

        recognition.onend = () => {
            if (micBtn) micBtn.classList.remove('listening');
        };

        // auto-stop after 10s in case not input came
        setTimeout(() => {
            try { recognition.stop(); } catch (e) { }
        }, 10000);
    }

    // MAIN: preserve your existing invokeAgentAction flow + parsing
    async handleSend() {

        this.scrollToBottom();

        const userMsg = (this.userInput || '').trim();
        if (!userMsg) return;

        this.messages = [
            ...this.messages,
            { id: Date.now(), text: userMsg, isAgent: false, time: this.getFormattedTime() }
        ];
        this.userInput = '';
        this.isLoading = true;

        const startTime = performance.now();

        try {
            // let response = await invokeAgentAction({
            //     userMessage: userMsg,
            //     sessionId: this.sessionId,
            //     agentApiName: this.selectedAgent
            // });
           let finalAgent =
        this.activeAgent && this.activeAgent !== 'Select_external_agent'
        ? this.activeAgent
        : this.selectedAgent;

if (finalAgent === undefined || finalAgent === null || finalAgent === '') {
    finalAgent = this.configAgentApiName;
}
        // if (!finalAgent || finalAgent === 'Select_external_agent') {
        // this.showToast(
        //    'Select Agent',
        //    'Please select an agent before sending a message.',
        //    'warning'
        // );
        //     return;
        // }

       // console.log('🚀 FINAL Agent going to Apex:', finalAgent);

        let response = await invokeAgentAction({
            userMessage: userMsg,
            sessionId: this.sessionId,
            agentApiName: finalAgent
        });

          //  console.log('Agent response:', response);


            const endTime = performance.now();
            const delaySeconds = ((endTime - startTime) / 1000).toFixed(2);

            if (typeof response === 'string') {
                try { response = JSON.parse(response); } catch (e) { }
            }

            /////

            let agentReply = '';
            if (response && response.agentResponse) {
                try {
                    const parsed = JSON.parse(response.agentResponse);
                    agentReply = parsed?.value || response.agentResponse;
                } catch (e) {
                    agentReply = response.agentResponse;
                }
            }

            const agentHtml = this.formatAgentText(agentReply || 'No response from Agent');

            this.sessionId = response?.agentSessionId || this.sessionId;

            this.messages = [
                ...this.messages,
                {
                    id: Date.now() + 1,
                    text: agentHtml,
                    isAgent: true,
                    time: this.getFormattedTime(),
                    delay: delaySeconds
                }
            ];
            ////

            this.scrollToBottom();
        } catch (err) {
            console.error('invokeAgentAction error', err);
            this.messages = [
                ...this.messages,
                { id: Date.now() + 2, text: '⚠️ Something went wrong', isAgent: true, time: this.getFormattedTime() }
            ];
        } finally {
            this.isLoading = false;
        }
    }


    scrollToBottom() {
        setTimeout(() => {
            const body = this.template.querySelector('.chat-body');
            if (body) body.scrollTop = body.scrollHeight;
        }, 120);
    }



    handleFooterInputChange(event) {
        this.userInput = event.detail.value || '';
    }

    handleFooterSendMessage() {
        this.handleSend();
    }

    handleFooterVoiceInput() {
        this.handleVoiceInput();
    }

    handleExpandToggle(event) {
        // if (this.isGrid) return; // disable expand fully

        this.isExpanded = event.detail.expanded;
        const popup = this.template.querySelector('.chat-popup');
        if (popup) {
            popup.classList.toggle('expanded', this.isExpanded);
        }
    }



    handleCallAssistance() {
        this.showCallAssistant = true;
    }
    closeCallAssistance() {
        this.showCallAssistant = false;
    }
    handleReadAloud(event) {
        const msgId = event.currentTarget.dataset.id;
        const message = this.messages.find(m => m.id == msgId);

        if (!message || !message.text) {
            this.showToast('Error', 'No text available to read aloud.', 'error');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Create the speech utterance 
        const utterance = new SpeechSynthesisUtterance(message.text);
        utterance.lang = 'en-US';
        utterance.rate = 1;     // Speed (1 = normal)
        utterance.pitch = 1;    // Pitch (1 = normal)
        utterance.volume = 1;   // Full volume

        // Speak it out
        window.speechSynthesis.speak(utterance);
    }

    handleRegenerate(event) {
        // Get the last USER message (not agent)
        const lastUserMessage = [...this.messages]
            .reverse()
            .find(msg => !msg.isAgent);

        if (!lastUserMessage) {
            this.showToast('Error', 'No previous user message found.', 'error');
            return;
        }

        // Set the input to last user query
        this.userInput = lastUserMessage.text;

        // Trigger send again
        this.handleSend();
    }


    // get chatPopupClass() {
    // return this.isGrid ? 'chat-popup normal-mode' : 'chat-popup';
    // }
    get chatPopupClass() {
        return this.isGrid ? 'chat-popup grid-mode' : 'chat-popup';
    }


    get isChatVisible() {
        return this.isGrid ? true : this.isChatOpen;
    }

    applyUserBubbleTheme() {
        // default gradient if nothing selected
        let gradient = 'linear-gradient(135deg, #0176d3, #00a1e0)'; // Blue default

        switch ((this.userBubbleTheme || 'Blue')) {
            case 'Blue':
                gradient = 'linear-gradient(135deg, #0176d3, #00a1e0)';
                break;
            case 'Green':
                gradient = 'linear-gradient(135deg, #1fbf7a, #0aa95b)';
                break;
            case 'Purple':
                gradient = 'linear-gradient(135deg, #7b61ff, #c86bff)';
                break;
            // case 'Sunset':
            //     gradient = 'linear-gradient(135deg, #ff7e5f, #feb47b)';
            //     break;
            // case 'Monochrome':
            //     gradient = 'linear-gradient(135deg, #333333, #777777)';
            //     break;
            case 'Custom':
                // use userBubbleCustom if provided, otherwise fall back
                if (this.userBubbleCustom && this.userBubbleCustom.trim()) {
                    gradient = this.userBubbleCustom.trim();
                } else {
                    gradient = 'linear-gradient(135deg, #0176d3, #00a1e0)';
                }
                break;
            default:
                gradient = 'linear-gradient(135deg, #0176d3, #00a1e0)';
        }

        // Apply as CSS variable on host so your CSS can use var(--user-bubble-bg)
        try {
            this.template.host.style.setProperty('--user-bubble-bg', gradient);
        } catch (e) {
            // fail silently
            // (older Locker/Shadow DOM differences — but this is safe in LWC)
        }
    }

    get brandNameStyle() {
        return `color: ${this.userBubbleTheme}`;
    }


    formatAgentText(raw) {
        if (!raw && raw !== '') return '';
        let s = String(raw);
        s = s.replace(/\\n/g, '\n');
        s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        s = s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
        s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        s = s.replace(/\n{2,}/g, '<br/><br/>');
        s = s.replace(/\n/g, '<br/>');
        return s;
    }

   handleAgentName(event) {
    console.log('🔥Received agent name from child:', event.detail.agentName);
    this.activeAgent = event.detail.agentName;
    console.log('😍Active Agent API Name:', this.activeAgent);
    //sessionStorage.setItem('activeAgent', this.activeAgent);
    }


}