import * as React from "react";
import { ScrollableList, IListItemDetails, ListSelection, ListItem } from "azure-devops-ui/List";
import { ArrayItemProvider, IItemProvider } from "azure-devops-ui/Utilities/Provider";
import { Icon, IconSize } from "azure-devops-ui/Icon";
import { NunitTestCase } from "../documents/nunit";

export interface ITaskItem {
    value: string;
    iconName: string;
    name: string;
}

interface TestCasePropertiesListProps {
    testCase: NunitTestCase
}

interface TestCasePropertiesListState {
    properties: IItemProvider<any>
}

export default class TestCasePropertiesList extends React.Component<TestCasePropertiesListProps, TestCasePropertiesListState>  {
    private selection = new ListSelection(true);
    private 

    constructor(props) {
        super(props);
        
        let propertiesList: ITaskItem[] = [
            {
                value: props.testCase.name,
                iconName: "TestPlan",
                name: "Name"
            },
            {
                value: props.testCase.methodName,
                iconName: "TestStep",
                name: "Method"
            },
            {
                value: props.testCase.className,
                iconName: "TestStep",
                name: "Class"
            },
            {
                value: props.testCase.seed,
                iconName: "Coffee",
                name: "Seed"
            },
            {
                value: props.testCase.runState,
                iconName: "TestAutoSolid",
                name: "Run State"
            }
        ];
        this.state = { 
            properties: new ArrayItemProvider(propertiesList)
        }
    }

    public render(): JSX.Element {
        return (
            <div style={{ display: "flex-ro", height: "300px" }} className="flex-row">
                <ScrollableList
                    itemProvider={this.state.properties}
                    renderRow={this.renderRow}
                    selection={this.selection}
                    width="100%"
                />
            </div>
        );
    }

    private renderRow = (
        index: number,
        item: ITaskItem,
        details: IListItemDetails<ITaskItem>,
        key?: string
    ): JSX.Element => {
        return (
            <ListItem key={key || "list-item" + index} index={index} details={details}>
                <div className="list-example-row flex-row h-scroll-hidden">
                    <Icon iconName={item.iconName} size={IconSize.medium} />
                    <div
                        style={{ marginLeft: "10px", padding: "10px 0px" }}
                        className="flex-column h-scroll-hidden"
                    >
                        <span className="text-ellipsis">{item.name}</span>
                        <span className="fontSizeMS font-size-ms text-ellipsis secondary-text">
                            {item.value}
                        </span>
                    </div>
                </div>
            </ListItem>
        );
    };
}