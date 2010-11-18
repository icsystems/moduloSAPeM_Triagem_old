#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os.path
from django.http import HttpResponse
from django.http import HttpResponseRedirect
import django.views.static as static
import mlp_net
import autocomplete as ac
import runNet as rn

name = 'Triagem Baseline Ambulatório'
version = 'v1.0.0'

def handle_request(request, fileName):
	curr_dir = os.path.realpath(os.path.dirname(__file__))
	media_dir = os.path.join(curr_dir, 'media')
	if fileName == '':
		fileName = "index.html"
	elif 'cgi-bin/autocomplete.py' in fileName:
		service = request.REQUEST['service']
		city = ''
		if 'city' in request.REQUEST:
			city = request.REQUEST['city']
		state = ''
		if 'state' in request.REQUEST:
			state = request.REQUEST['state']
		q = ''
		if 'query' in request.REQUEST:
			q = request.REQUEST['query']
		return HttpResponse(ac.Main(service,city,state,q))
	elif fileName == 'cgi-bin/runNet.py':
		return HttpResponse(rn.runNet())
	return static.serve(request, fileName, document_root=media_dir,
	show_indexes=True)

__all__ = ['name','version','handle_request']

