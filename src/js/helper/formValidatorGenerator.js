export default function formValidatorGenerator(formSchema, formData, errors, validationDeclaration) {
    // console.log(formSchema)
    // console.log(formData)
    // console.log(errors)
    // console.log(validationRules)
    if (!validationDeclaration){
        return;
    }
    // TODO nested field
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