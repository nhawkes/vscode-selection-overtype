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
			const isCharUpper = char !== char.toLowerCase();
			const isCharLower = char !== char.toUpperCase();
			const invert = args.text === args.text.toUpperCase();
			const toUpper = !invert ? isCharUpper : isCharLower;
			const toLower = !invert ? isCharLower : isCharUpper;
			return {
				replaceSelection,
				newSelection,
				toUpper,
				toLower
			};
		});
		editor.edit(editBuilder => {
			newSelections.map(x => {
				if (!x.replaceSelection) {
					return;
				}
				let text = args.text;
				if (x.toUpper) {
					text = text.toUpperCase();
				}
				if (x.toLower) {
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
