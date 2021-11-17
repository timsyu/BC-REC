from os import name
import numpy as np
import distribution
import json
import argparse

parser = argparse.ArgumentParser(description='Generate distribution json')
parser.add_argument('--filename', type=str, default='distri.json',
                    help='json file name')


def generateOutput(filename):
    dis = distribution.Distribution()
    dnormal = dis.draw_normal(seed=1111, mu=10, sigma=2, size=100, toInt=True,draw=True)
    vals, counts = np.unique(dnormal, return_counts=True)
    # np.array to list
    counts = counts.tolist()
    data = []
    count = 0
    for i in range(len(vals)):
        num = vals[i]
        for j in range(num):
            count+=1
            info = {'name': count ,'num': counts[i]}
            data.append(info)
    # print(data)
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump({'data': data, 'count': count}, f, ensure_ascii=False, indent=4)
    print(True)

if __name__ == '__main__':
    args = parser.parse_args()
    print(args.filename)
    generateOutput(args.filename)