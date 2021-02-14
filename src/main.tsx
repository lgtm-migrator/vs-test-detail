/// <reference types="vss-web-extension-sdk" />

import * as React from "react";
import * as ReactDOM from "react-dom";
import NUnitPageState from "./ui/card";

import { SurfaceBackground, SurfaceContext } from "azure-devops-ui/Surface";

import {TestHttpClient5} from "TFS/TestManagement/RestClient";
import {NunitXMLDocument, isNunitXml} from "./documents/nunit";
import {ErrorMessage} from "./ui/errorWindow";
import {Nunit2XMLDocument, isNunit2Xml} from "./documents/nunit2";
import {ErrorBoundary} from "./ui/errorBoundary"
import { isJunitXml, JunitXMLDocument } from "./documents/junit";

let parser: DOMParser = new DOMParser();
let enc: TextDecoder = new TextDecoder();

export const showError = function(message){
    ReactDOM.render(
        <SurfaceContext.Provider value={{ background: SurfaceBackground.neutral }}>
          <ErrorMessage message={message}/>
        </SurfaceContext.Provider>,
        document.getElementById("error")
    );
};

VSS.ready(function() {

    let extensionContext: any = VSS.getConfiguration();
    let testCaseName: string = "";
    let projectId: string = VSS.getWebContext().project.id;

    VSS.require(["VSS/Service", "TFS/TestManagement/RestClient"], function (VSS_Service, TFS_Test_WebApi) {
        const testClient:TestHttpClient5 = VSS_Service.getCollectionClient(TFS_Test_WebApi.TestHttpClient5);

        const processAttachment = function (buf: ArrayBuffer) {
            let out: string = enc.decode(buf);
            const dom: Document = parser.parseFromString(out, 'text/xml');

            let doc: any = undefined;

            if (isNunitXml(dom)) {
                doc = new NunitXMLDocument(dom);
            } else if (isNunit2Xml(dom)) {
                doc = new Nunit2XMLDocument(dom);
            } else if (isJunitXml(dom)) {
                doc = new JunitXMLDocument(dom);
            } else {
                showError("Attachment is not a valid NUnit/JUnit XML file. See documentation for supported formats.");
                return;
            }

            let testPlan = doc.getPlan();
            if (!testPlan) {
                showError("Could not locate a test plan object. ");
                return;
            }

            let testCase = doc.getCase(testCaseName);
            if (!testCase) {
                showError("Could not locate a matching test case '" + testCaseName + "'in the results. ");
                return;
            }
            let testSuite = testCase.getTestSuite();
            if (!testSuite) {
                showError("Could not locate a matching test suite in the results. ");
                return;
            }

            ReactDOM.render(
                <SurfaceContext.Provider value={{ background: SurfaceBackground.neutral }}>
                    <ErrorBoundary>
                        <NUnitPageState testPlan={testPlan} testCase={testCase} testSuite={testSuite}/>
                    </ErrorBoundary>
                </SurfaceContext.Provider>,
                document.getElementById("root")
            );
        };

        const scopeAttachments = function (attachments) {
            console.log("Fetched attachments");
            let foundAttachment = false;
            for (let i = 0; i < attachments.length; i++) {
                if (attachments[i].fileName.endsWith(".xml")) {
                    testClient.getTestRunAttachmentContent(projectId, extensionContext.runId, attachments[i].id).then(processAttachment);
                    foundAttachment = true;
                }
            }
            if (!foundAttachment){
                showError("Could not locate an XML attachment in the test run attachments. ");
            }
        };

        testClient.getTestResultById(projectId, extensionContext.runId, extensionContext.resultId).then(
            function(result){
                testCaseName = result.automatedTestName;
                testClient.getTestRunAttachments(projectId, extensionContext.runId).then(scopeAttachments);
            }
        );
    });
});

