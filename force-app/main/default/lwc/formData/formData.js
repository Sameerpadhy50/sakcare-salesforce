import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class FormData extends LightningElement {

    @track formFields = {
        fullName: '',
        email: '',
        phone: '',
        company: ''
    };

    @track isSuccess = false;

    handleChange(event) {
        const field = event.target.name;
        this.formFields = {
            ...this.formFields,
            [field]: event.target.value
        };
        this.isSuccess = false;
    }

    handleSubmit() {
        const allValid = this.validateForm();
        if (!allValid) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Validation Error',
                    message: 'Please fill in all required fields correctly.',
                    variant: 'error'
                })
            );
            return;
        }
        console.log('Form Data Submitted:', JSON.stringify(this.formFields));
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Form submitted successfully!',
                variant: 'success'
            })
        );
        this.isSuccess = true;
    }

    handleReset() {
        this.formFields = { fullName: '', email: '', phone: '', company: '' };
        this.isSuccess = false;
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.value = '';
        });
    }

    validateForm() {
        const inputs = this.template.querySelectorAll('lightning-input');
        let allValid = true;
        inputs.forEach(input => {
            if (!input.reportValidity()) {
                allValid = false;
            }
        });
        return allValid;
    }
}
