// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('type', (args: { text: string }) => {
		var editor = vscode.window.activeTextEditor;
		if (!editor || args.text === "\r" || args.text === "\n" || args.text === "\r\n") {
			return vscode.commands.executeCommand("default:type", args);
		}
		var selections = editor.selections;
		if (selections.length === 0 || selections[0].isEmpty) {
			return vscode.commands.executeCommand("default:type", args);
		}
		const textIsLower = args.text !== args.text.toUpperCase();
		const textIsUpper = args.text !== args.text.toLowerCase();
		const textIsNumber = args.text >= '0' && args.text <= '9';
		if (!(textIsLower || textIsUpper||textIsNumber)) {
			return vscode.commands.executeCommand("default:type", args);
		}
		const newSelections = selections.map(selection => {
			if (!editor || selection.isEmpty) {
				return {
					newSelection: selection
				};
			}
			const newStart = selection.start.translate(0, 1);
			const replaceSelection = new vscode.Selection(selection.start, newStart);
			const newSelection = new vscode.Selection(selection.end, newStart);
			const char = editor.document.getText(replaceSelection);
			return {
				replaceSelection,
				newSelection,
				char
			};
		});
		const primaryCharIsUpper = newSelections[0].char !== newSelections[0]?.char?.toLowerCase();
		const swapCase = primaryCharIsUpper !== textIsUpper ? true : false;

		editor.edit(editBuilder => {
			newSelections.map(x => {
				if (!x.replaceSelection) {
					return;
				}
				const isCharUpper = x.char !== x.char.toLowerCase();
				const isCharLower = x.char !== x.char.toUpperCase();
				const toUpper = !swapCase ? isCharUpper : isCharLower;
				const toLower = !swapCase ? isCharLower : isCharUpper;
				let text = args.text;
				if (toUpper) {
					text = text.toUpperCase();
				}
				if (toLower) {
					text = text.toLowerCase();
				}
				editBuilder.replace(x.replaceSelection, text);


			});
		}, {
			undoStopBefore: false,
			undoStopAfter: false
		});
		editor.selections = newSelections.map(x => x.newSelection);
		return undefined;
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
