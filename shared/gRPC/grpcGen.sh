npx grpc_tools_node_protoc --js_out=import_style=commonjs,binary:. --grpc_out=. --plugin=protoc-gen-grpc=/home/abhishek/ssd/codes/automation/node_modules/.bin/grpc_tools_node_protoc_plugin pumpDataTransfer.proto

npx grpc_tools_node_protoc --ts_out=. --plugin=protoc-gen-ts=/home/abhishek/ssd/codes/automation/node_modules/.bin/protoc-gen-ts pumpDataTransfer.proto