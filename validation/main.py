from os import name
import numpy as np
import distribution
import json
import argparse

parser = argparse.ArgumentParser(description='Generate distribution json')
parser.add_argument('--filename', type=str, default='distri.json',
                    help='json file name')
parser.add_argument('--mode', type=str,
                    help='device or plant')

def generateOutput(mode, filename):
    dis = distribution.Distribution()
    dnormal = dis.draw_normal(seed=1111, mu=10, sigma=2, size=100, toInt=True,draw=True)
    vals, counts = np.unique(dnormal, return_counts=True)
    # np.array to list
    counts = counts.tolist()
    data = []
    count = 0
    if mode == "device" :
        orgCount = 0
        for i in range(len(vals)):
            num = vals[i]
            c = counts[i]
            for j in range(c):
                orgCount+=1
                for k in range(num):
                    count+=1
                    info = {'name': count,'orgId': orgCount}
                    data.append(info)
    elif mode == "plant" :
        count = 0
        for i in range(len(vals)):
            num = counts[i]
            for j in range(num):
                count+=1
                info = {'name': count ,'num': counts[i]}
                data.append(info)
    out = {'data': data, 'count': count}
    # print(out)
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=4)
    print(True)

if __name__ == '__main__':
    args = parser.parse_args()
    print(args.filename)
    print(args.mode)
    if(args.mode == "device" or args.mode == "plant"):
        generateOutput(args.mode, args.filename)