.386

Data1 segment
	String db 'Hello'
	Val	db 10111111b
	Vw dw 1234d
	Vd dd 0d7856fdah
Data1 ends

Data2 segment
	Var	dw -128
	QWERTY dd 67ff89h
	Zxcv db 0ffh
    x dw 65535
Data2 ends

Code1 segment
Assume cs:Code1, ds:Data1, gs:Data2
begin:
    jmp	short label1
	nop
	nop
	nop
	imul eax
    imul bh
	mul	byte ptr gs:[esp + ecx]
    mul	byte ptr ds:[esp + ecx]
    mul	byte ptr ss:[esp + ecx]
    mul	byte ptr [esp + ecx]
	idiv bl
	or byte ptr ds:[edx + esi], 11111111b
	sub dword ptr [ebx + ecx], eax
	cmp eax, 1A234567h
	jmp	short label1
label1:
    jmp	short label1
	cmp ebx, 'text'
	jnb label2
	adc al, byte ptr [edx + esi]
    adc esi, dword  ptr [edx + eax]
	jmp label1
    jnb label2
label2:
    jnb label2
	cmp al, '2'
	jnb label2
	nop
	nop
Code1 ends

end