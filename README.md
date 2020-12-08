# Dynamic-JSON-Form-Builder

This is a React Component that can generate Form based on JSON Schema definition.

This repository contains the React front-end that use `dynamic-json-form-builder` library and a Node.js `simple-server` back-end.

## Getting Started

### Installation

This Component is already published to NPM, use `npm` or `yarn` to download to local directory

```bash
npm i dynamic-json-form-builder
yarn add dynamic-json-form-builder
```

Import form component

```javascript
import Form from 'dynamic-json-form-builder/src/js/component/formComponent'
```

### Basic usage

```jsx
<Form
   formID={"user-profile-form"}
   resourceURL={"form/"}
   validationDeclaration={this.validationDeclaration}
   HTTPMethod={"PATCH"}
   formContext={{
   	 api: api,
     globalContext: {language,LanguageContext},
     style: style
   }}
/>
```

### Props

#### formID:

This prop defines the HTML `id` attribute of the form.

#### resourceURL

This prop defines the sub url for the `api` to connect to the server endpoint. It is used to fetch `JSON` type <strong>Form Schema</strong> and patch  `JSON` type <strong>Form Data</strong> to the server.  The file `upload, download and preview feature` also require this sub url to connect to the endpoint.

#### validationDeclaration

This prop defines the custom validation methods for the form field.

#### HTTPMethod

This prop defines the HTTP method to send the <strong>FormData</strong> to the server, accepted options are `PATCH, POST, PUT`.

#### formContext

This prop define an object that will be passed to all the fields and widgets. Right now, it is mandatory to pass an `api` component, a `React Context` component and a `CSS module`.

##### api component

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL:
        'http://127.0.0.1:port/'
    });
export default api;
```

The `api` component exports the `axios` service, it defines the baseURL inside. The `baseURL` is linked to the `subURL` that become a complete url of the end point.

##### globalContext component

```javascript
import {createContext} from 'react';

export const language = {
    EN: {
        language: 'EN',
        color: '#EF689F',
        submitBtnColor: '#e01b6b',
        submitBtnContent: 'Submit',
        cancelBtnColor: '#F5AECB',
        cancelBtnContent: 'Cancel'
    },
    FR: {
        language: 'FR',
        color: '#7BAAF8',
        submitBtnColor: '#3498DB',
        submitBtnContent: 'Soumettre',
        cancelBtnColor: '#7FB3D5',
        cancelBtnContent: 'Annuler'
    },
    SP: {
        language: 'SP',
        color: '#4d9f3c',
        submitBtnColor: '#1d9402',
        submitBtnContent: 'Enviar',
        cancelBtnColor: '#78a26f',
        cancelBtnContent: 'Cancelar'
    }
}

export const LanguageContext = createContext({
    language: language.EN,
    toggleLanguage: () => {
    },
});
```

The `globalContext` is a regular `react context` component that define the `language` information. The form uses this `language` to display different styles `button` and multilingual field. 

In order to make `globalContext` work, the form component or its parent component must be wrapped inside `<LanguageContext.Provider>` tag

##### style

```css
.btnLanguage {
  border-radius: 0.0rem 0.2rem 0.2rem 0.0rem !important;
  font-size: 0.875rem !important;
  width: 2.4rem !important;
  color: #989494 !important;
  border-color: #ced4da !important;
  z-index: 0 !important;
}

.btnUndo {
  padding: 0.25rem 0.5rem !important;
  line-height: 1.5 !important;
  border-radius: 0.2rem 0.2rem 0.2rem 0.2rem !important;
  font-size: 0.9rem !important;
  color: cornflowerblue !important;
}

.msgError {
  color: red;
}
```

The `style` is a `css module` file that all form `field` and `widget` can use.

### Sample FormSchema and DataSchema

```json
{
  "type": "object",
  "title": "User Profile",
  "id": "user_profile_form",
  "fieldLanguages": ["en","fr"],
  "required": [
    "name"
  ],
  "properties": {
    "name": {
      "type": "string",
      "title": "Name",
      "id": "name"
    },
    "gender": {
      "type": "string",
      "title": "Gender",
      "id": "gender",
      "enum": [
        "Male",
        "Female"
      ]
    },
    "hobby": {
      "type": "string",
      "title": "Hobby",
      "id": "hobby",
      "largeEnum": true,
      "enum": [
        "3D printing",
        "amateur radio",
        "scrapbook",
        "Amateur radio",
        "Acting"
      ]
    },
    "comment": {
      "type": "string",
      "title": "Comment",
      "id": "comment",
      "bilingual": true
    },
    "signature": {
      "type": "string",
      "title": "Signature",
      "id": "signature"
    },
    "education": {
      "type": "array",
      "title": "Education",
      "id": "education",
      "items": {
        "type": "object",
        "id": "education_array_item",
        "properties": {
          "degree": {
            "type": "string",
            "title": "Degree",
            "id": "degree",
            "enum": [
              "Bachelor of Applied Science",
              "Bachelor of Arts",
              "Bachelor of Commerce",
              "Bachelor of Science"
            ]
          },
          "institution": {
            "title": "Institution",
            "id": "institution",
            "multiCol": true,
            "enum": [
              [
                "Carleton University",
                "Ottawa",
                "Ontario",
                "Canada"
              ],
              [
                "University of Ottawa",
                "Ottawa",
                "Ontario",
                "Canada"
              ]
            ]
          }
        }
      }
    },
    "resume": {
      "type": "string",
      "format": "file",
      "title": "Resume",
      "id": "resume",
      "accepts": [
        ".pdf",
        ".docx",
        ".xlsx",
        ".jpeg",
        ".png",
        ".jpg"
      ]
    }
  }
}
```

```json
{
  "education": [
    {
      "degree": "Bachelor of Commerce",
      "institution": [
        "Carleton University",
        "Ottawa",
        "Ontario",
        "Canada"
      ]
    },
    {
      "degree": "Bachelor of Science",
      "institution": [
        "University of Ottawa",
        "Ottawa",
        "Ontario",
        "Canada"
      ]
    }
  ],
  "name": "XIANG",
  "comment": "{\"language\":\"Bilingual\",\"EN\":\"w\",\"SP\":\"sp\"}",
  "gender": "Female"
}
```

### Further work

Make `formContext` optional.

Make `validationDeclaration` more powerful, right now it doesn't work for nested field.