export default function formValidatorGenerator(formSchema, formData, errors, validationDeclaration) {
    if (!validationDeclaration){
        return;
    }
    Object.keys(errors).forEach(field => {
        if (field !== "__errors" && field !== "addError") {
            if (validationDeclaration.hasOwnProperty(field)) {
                // console.log(field);
                let errMsg = validationDeclaration[field](formData[field]);
                if (errMsg) {
                    errors[field].addError(errMsg);
                }
            }
        }
    })
}