# :wave: How to use mark mind

#### Default

| Skin  | Language | Open Markdown | Canvas Size(px) |
| ----- | -------- | ------------- | --------------- |
| White | Chinese  | No            | 8000x8000       |

### How To Change Default Setting？

Open Menu-->Setting-->Enter Setup Page-->Change to the configuration you need-->Sure

## MarkMind Shortcut

### Base ShorCut

| New Mind Map              | Ctrl/Cmd+N       |
| ------------------------- | ---------------- |
| Open Mind Map             | Ctrl/Cmd+O       |
| Save Mind Map             | Ctrl/Cmd+S       |
| Save As                   | Ctrl/Cmd+Shift+S |
| Quit                      | Ctrl/Cmd+Q       |
| Undo                      | Ctrl/Cmd+Z       |
| Redo                      | Ctrl/Cmd+Y       |
| Show or Hide Tomato Clock | Ctrl/Cmd + T     |

## Mind Map ShorCut

| New Brother Node     | Shift+Enter/Enter                   |
| -------------------- | ----------------------------------- |
| New Child Node       | Tab<br/>Insert                      |
| Node Parent Node     | Ctrl/Cmd+P     <br/>Ctrl/Cmd+Insert |
| Delete Node          | Delete                              |
| Edit Node            | Space                               |
| Quit Edit Node       | Esc/tab                             |
| Expand/collapse Node | Ctrl/Cmd + /                        |
| Set Priority         | Ctrl/Cmd+1~8                        |
| Presentation         | Left/Right                          |
| Quit Presentation    | Esc                                 |
| Move Canvas          | Shift + Mouse Wheel                 |

## Outline ShorCut

| New Brother Node              | Enter                                                       |
| ----------------------------- | ----------------------------------------------------------- |
| Indent                        | Tab                                                         |
| Unindent                      | Shift+Tab                                                   |
| Unindent (Keep Node Position) | window : Ctrl/Cmd + Shift +Tab<br/>Mac os : Alt +Shift +Tab |
| Search                        | Ctrl / Cmd +F                                               |
| Find And Replace              | Ctrl / Cmd + H<br>Enter To Replace                          |
| Zoom in                       | Ctrl/Cmd+](Or Double Click Dott)                            |
| Zoom out                      | Ctrl/Cmd+[                                                  |
| Select prev/next item         | Up/Down                                                     |
| Move up/down  node            | Ctrl/Cmd + up/<br/>Ctrl/Cmd + down                          |
| Multi select node             | shift + click node of same level                            |

### Convenient Operation

![68747470733a2f2f73312e617831782e636f6d2f323032302f30372f30362f55436a4645542e676966.gif](https://i.loli.net/2020/11/21/wM5VuWfoFrHqzBm.gif)

![68747470733a2f2f7777772e7a7839352e6e65742f696d616765732f323032302f30372f31342f6464322e676966.gif](https://i.loli.net/2020/11/21/ipSaBMEvG1JW6CR.gif)

![1595152075872-481048dc-f00f-4983-91d1-22d3a0f9911b.gif](https://i.loli.net/2020/11/21/uxiVRDvkMs9bW28.gif)

### Matters needing attention

#### About picture relative path

- When using the relative path, the open document must be on the storage disk. If a new document is created, the relative path cannot be used since it has not been saved at this time (it can be used after saving).
- The base relative path is based on the folder containing the open document. For example, the open document path is: c:/markmind/xxx.mind and the base relative path is: c:/markmind/
- ./ Represents peer documents, .. / Represents the parent folder
- Note that documents using relative or absolute path images must be packaged together when sharing, otherwise the recipient will not be able to display the image

#### About plantuml

- The default user online use, plantuml server address is: http://www.plantuml.com/plantuml
- If your environment cannot be connected to the Internet, then you need to install Plantuml yourself and set the server address of Plantuml on the Settings page, otherwise plantumL cannot be used

#### About OneDrive

- At present, only onedrive's read, modify and save operation is supported, and file's move and delete operation is not supported temporarily
- Possible problems, when the network is not good or cannot read the document, it is possible to report an error

#### Some details

#### About the katex

- Notice the difference between Katex and Mathjax syntax

#### How to remove the layout of branch nodes?

- Right click -- layout -- Delete Layout (bottom option)

#### How to remove or add text to the relate link line?

- Clear text on the relate link line -> remove text
- Double  click the relate link line -> add text

#### Node default Settings

- The default width of a node is 800px. When using functions such as gantt chart, the node width may be exceeded. In this case, you can use right click - resize the node to solve the problem of insufficient width

#### Node MarkDown Link

- Allows you to add links to local files
- Support like this syntax: `[![](../ pic/picture. PNG)](.. / pic/image.pdf)`, you can open the local file on the mind map node, make sure the relative path is correct
